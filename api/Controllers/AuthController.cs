using Api.Contracts.Auth;
using Api.Contracts.Users;
using Api.Data.Users;
using Api.Data.Users.Models;
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

        return ToDto(userSummary);
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

        return ToDto(userSummary);
    }

    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<IEnumerable<IdentityError>>(StatusCodes.Status400BadRequest)]
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
            return BadRequest(result.Errors);
        }

        return NoContent();
    }

    private UnauthorizedObjectResult InvalidLoginAttempt()
    {
        return Unauthorized(new ProblemDetails
        {
            Title = "Invalid email or password.",
            Status = StatusCodes.Status401Unauthorized,
        });
    }

    private static UserSummaryDto ToDto(UserSummary userSummary)
    {
        return new UserSummaryDto(userSummary.Email, userSummary.Name);
    }
}
