namespace Api.Contracts.Auth;

public sealed record MfaSetupDto(string SharedKey, string AuthenticatorUri);