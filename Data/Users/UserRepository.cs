using Npgsql;
using Api.Data.Users.Models;

namespace Api.Data.Users;

public interface IUserRepository
{
	Task CreateIfMissingAsync(string email, string name, string identityId, CancellationToken cancellationToken = default);
	Task<UserSummary?> GetUserSummaryByIdentityId(string identityId, CancellationToken cancellationToken = default);
}

public sealed class UserRepository : IUserRepository
{
	private readonly ISqlCommandFactory<UserRepository> _sqlCommandFactory;

	public UserRepository(ISqlCommandFactory<UserRepository> sqlCommandFactory)
	{
		_sqlCommandFactory = sqlCommandFactory;
	}

	public async Task CreateIfMissingAsync(string email, string name, string identityId, CancellationToken cancellationToken = default)
	{
		await using var cmd = await _sqlCommandFactory.CreateAsync("create_user_if_missing", cancellationToken);

		cmd.Parameters.Add(new NpgsqlParameter { Value = email });
		cmd.Parameters.Add(new NpgsqlParameter { Value = name });
		cmd.Parameters.Add(new NpgsqlParameter { Value = identityId });

		await cmd.ExecuteNonQueryAsync(cancellationToken);
	}

	public async Task<UserSummary?> GetUserSummaryByIdentityId(string identityId, CancellationToken cancellationToken = default)
	{
		await using var cmd = await _sqlCommandFactory.CreateAsync("get_user_summary", cancellationToken);

		cmd.Parameters.Add(new NpgsqlParameter { Value = identityId });

		await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
		if (!await reader.ReadAsync(cancellationToken))
		{
			return null;
		}

		var email = reader.GetString(reader.GetOrdinal("email"));
		var name = reader.GetString(reader.GetOrdinal("name"));

		return new UserSummary(email, name);
	}
}
