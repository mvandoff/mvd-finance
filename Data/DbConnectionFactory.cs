// NOTE: Currently unused, may be more useful when adding Dapper

using System.Data.Common;
using Npgsql;

namespace api.Data;

public interface IDbConnectionFactory
{
	Task<DbConnection> OpenConnectionAsync(CancellationToken cancellationToken = default);
}


internal sealed class DbConnectionFactory : IDbConnectionFactory
{
	private readonly NpgsqlDataSource _dataSource;

	public DbConnectionFactory(NpgsqlDataSource dataSource)
	{
		_dataSource = dataSource;
	}

	public async Task<DbConnection> OpenConnectionAsync(CancellationToken cancellationToken = default)
	{
		return await _dataSource.OpenConnectionAsync(cancellationToken);
	}

}
