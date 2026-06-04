using Api.Contracts.Users;

namespace Api.Contracts.Auth;

public sealed record class LoginResponse(bool RequiresChallenge, UserSummaryDto? UserSummary);
