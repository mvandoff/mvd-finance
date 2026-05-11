using Api.Data.Users.Models;

namespace Api.Data.Users;

public interface IUserRepository
{
	Task CreateIfMissingAsync(string email, string name, string identityId, CancellationToken cancellationToken = default);
	Task<UserSummary?> GetUserSummaryByIdentityId(string identityId, CancellationToken cancellationToken = default);
}

public sealed class UserRepository : IUserRepository
{
	private readonly IQueryRunner<UserRepository> _queryRunner;

	public UserRepository(IQueryRunner<UserRepository> queryRunner)
	{
		_queryRunner = queryRunner;
	}

	public async Task CreateIfMissingAsync(string email, string name, string identityId, CancellationToken cancellationToken = default)
	{
		await _queryRunner.ExecuteAsync(
			"create_user_if_missing",
			new { Email = email, Name = name, IdentityId = identityId },
			cancellationToken
		);
	}

	public async Task<UserSummary?> GetUserSummaryByIdentityId(string identityId, CancellationToken cancellationToken = default)
	{
		return await _queryRunner.QuerySingleOrDefaultAsync<UserSummary>(
			"get_user_summary",
			new { IdentityId = identityId },
			cancellationToken
		);
	}
}
