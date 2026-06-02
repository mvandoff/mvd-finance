namespace Api.Contracts.Auth;

public sealed record SetMfaEnabledRequst(bool enabled, string code);