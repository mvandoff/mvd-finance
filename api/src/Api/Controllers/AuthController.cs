using System.Text.Encodings.Web;
using Api.Contracts.Auth;
using Api.Contracts.Users;
using Api.Data.Users;
using Api.Data.Users.Models;
using Api.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IUserRepository _userRepository;

    public AuthController(
        SignInManager<IdentityUser> signInManager,
        UserManager<IdentityUser> userManager,
        IUserRepository userRepository
    )
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _userRepository = userRepository;
    }

    [HttpPost("login")]
    [ProducesResponseType<UserSummaryDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserSummaryDto>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return InvalidLoginAttempt();
        }

        var result = await _signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: true
        );

        if (!result.Succeeded)
        {
            return InvalidLoginAttempt();
        }

        var userSummary = await _userRepository.GetUserSummaryByIdentityId(user.Id);
        if (userSummary == null)
        {
            return Problem(
                title: "User profile was not found.",
                detail: "The identity user exists, but no matching finance profile exists for this account.",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }

        return ToDto(userSummary, user);
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<UserSummaryDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserSummaryDto>> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var userSummary = await _userRepository.GetUserSummaryByIdentityId(user.Id);
        if (userSummary == null)
        {
            return Problem(
                title: "User profile was not found.",
                detail: "The identity user exists, but no matching finance profile exists for this account.",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }

        return ToDto(userSummary, user);
    }

    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword
        );

        if (!result.Succeeded)
        {
            return ApiErrors.IdentityValidationErrors(result.Errors);
        }

        return NoContent();
    }

    [Authorize]
    [HttpPost("mfa/create-setup-key")]
    [ProducesResponseType<MfaSetupKeyDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<MfaSetupKeyDto>> CreateMfaSetupKey()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }
        var sharedKey = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(sharedKey))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            sharedKey = await _userManager.GetAuthenticatorKeyAsync(user);

            if (string.IsNullOrEmpty(sharedKey))
            {
                throw new NotSupportedException("The user manager must produce an authenticator key after reset.");
            }
        }

        string authenticatorUriFormat = "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6";
        var urlEncoder = UrlEncoder.Create();
        return new MfaSetupKeyDto(
            sharedKey,
            string.Format(
                authenticatorUriFormat,
                urlEncoder.Encode("Clearbook"),
                urlEncoder.Encode(user.Email!),
                urlEncoder.Encode(sharedKey)
        ));
    }

    [Authorize]
    [HttpPost("mfa/set-mfa-enabled")]
    [ProducesResponseType<UserSummaryDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserSummaryDto>> SetMfaEnabled(SetMfaEnabledRequst request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        if (!await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            request.code))
        {
            return InvalidTwoFactorCode();
        }

        var result = await _userManager.SetTwoFactorEnabledAsync(user, request.enabled);
        if (!result.Succeeded)
        {
            return ApiErrors.IdentityValidationErrors(result.Errors);
        }

        var userSummary = await _userRepository.GetUserSummaryByIdentityId(user.Id);
        if (userSummary == null)
        {
            return Problem(
                title: "User profile was not found.",
                detail: "The identity user exists, but no matching finance profile exists for this account.",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }

        return ToDto(userSummary, user);
    }

    private static UnauthorizedObjectResult InvalidLoginAttempt()
    {
        return ApiErrors.UnauthorizedProblem("Invalid email or password.");
    }

    private static BadRequestObjectResult InvalidTwoFactorCode()
    {
        return ApiErrors.ValidationError(
            "code",
            "The 2fa token provided by the request was invalid. A valid 2fa token is required to enable 2fa."
        );
    }

    private static UserSummaryDto ToDto(UserSummary userSummary, IdentityUser identityUser)
    {
        return new UserSummaryDto(userSummary.Email, userSummary.Name, identityUser.TwoFactorEnabled);
    }

}
