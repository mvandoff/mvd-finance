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
	private readonly NpgsqlDataSource _dataSource;
	private readonly ISqlFileReader<UserRepository> _sqlFileReader;

	public UserRepository(NpgsqlDataSource dataSource, ISqlFileReader<UserRepository> sqlFileReader)
	{
		_dataSource = dataSource;
		_sqlFileReader = sqlFileReader;
	}

	public async Task CreateIfMissingAsync(string email, string name, string identityId, CancellationToken cancellationToken = default)
	{
		string sql = await _sqlFileReader.ReadAsync("create_user_if_missing", cancellationToken);
		await using var cmd = _dataSource.CreateCommand(sql);

		cmd.Parameters.Add(new NpgsqlParameter { Value = email });
		cmd.Parameters.Add(new NpgsqlParameter { Value = name });
		cmd.Parameters.Add(new NpgsqlParameter { Value = identityId });

		await cmd.ExecuteNonQueryAsync(cancellationToken);
	}

	public async Task<UserSummary?> GetUserSummaryByIdentityId(string identityId, CancellationToken cancellationToken = default)
	{
		string sql = await _sqlFileReader.ReadAsync("get_user_summary", cancellationToken);
		await using var cmd = _dataSource.CreateCommand(sql);

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
