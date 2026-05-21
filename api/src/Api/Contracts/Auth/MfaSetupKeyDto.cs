namespace Api.Contracts.Auth;

public sealed record MfaSetupKeyDto(string SharedKey, string AuthenticatorUri);
