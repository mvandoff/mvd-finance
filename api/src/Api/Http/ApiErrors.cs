using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Api.Http;

/// <summary>
/// Centralizes API error response shapes so controllers return consistent ProblemDetails payloads.
/// </summary>
public static class ApiErrors
{
    public static BadRequestObjectResult ValidationError(string name, string message)
    {
        return ValidationErrors(new Dictionary<string, string[]>
        {
            [name] = [message]
        });
    }

    public static BadRequestObjectResult ValidationErrors(IDictionary<string, string[]> errors)
    {
        return new BadRequestObjectResult(new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred."
        });
    }

    public static BadRequestObjectResult IdentityValidationErrors(IEnumerable<IdentityError> errors)
    {
        var validationErrors = errors
            .GroupBy(error => error.Code)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Description).ToArray()
            );

        return ValidationErrors(validationErrors);
    }

    public static UnauthorizedObjectResult UnauthorizedProblem(string title)
    {
        return new UnauthorizedObjectResult(new ProblemDetails
        {
            Title = title,
            Status = StatusCodes.Status401Unauthorized,
        });
    }
}
