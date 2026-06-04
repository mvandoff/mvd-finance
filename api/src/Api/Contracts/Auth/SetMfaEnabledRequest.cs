namespace Api.Contracts.Auth;

public sealed record SetMfaEnabledRequest(bool enabled, string code);
