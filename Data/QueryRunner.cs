using Dapper;
using Npgsql;

namespace Api.Data;

public interface IQueryRunner<TAnchor>
{
	Task<int> ExecuteAsync(string queryName, object? parameters = null, CancellationToken cancellationToken = default);
	Task<IReadOnlyList<T>> QueryAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);
	Task<T> QuerySingleAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);
	Task<T?> QuerySingleOrDefaultAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);
}

public sealed class QueryRunner<TAnchor> : IQueryRunner<TAnchor>
{
	private readonly NpgsqlDataSource _dataSource;
	private readonly ISqlFileReader<TAnchor> _sqlFileReader;

	public QueryRunner(NpgsqlDataSource dataSource, ISqlFileReader<TAnchor> sqlFileReader)
	{
		_dataSource = dataSource;
		_sqlFileReader = sqlFileReader;
	}

	public async Task<int> ExecuteAsync(string queryName, object? parameters = null, CancellationToken cancellationToken = default)
	{
		var sql = await _sqlFileReader.ReadAsync(queryName, cancellationToken);
		await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

		return await connection.ExecuteAsync(CreateCommand(sql, parameters, cancellationToken));
	}

	public async Task<IReadOnlyList<T>> QueryAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default)
	{
		var sql = await _sqlFileReader.ReadAsync(queryName, cancellationToken);
		await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
		var results = await connection.QueryAsync<T>(CreateCommand(sql, parameters, cancellationToken));

		return results.AsList();
	}

	public async Task<T> QuerySingleAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default)
	{
		var sql = await _sqlFileReader.ReadAsync(queryName, cancellationToken);
		await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

		return await connection.QuerySingleAsync<T>(CreateCommand(sql, parameters, cancellationToken));
	}

	public async Task<T?> QuerySingleOrDefaultAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default)
	{
		var sql = await _sqlFileReader.ReadAsync(queryName, cancellationToken);
		await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

		return await connection.QuerySingleOrDefaultAsync<T>(CreateCommand(sql, parameters, cancellationToken));
	}

	private static CommandDefinition CreateCommand(string sql, object? parameters, CancellationToken cancellationToken)
	{
		return new CommandDefinition(sql, parameters, cancellationToken: cancellationToken);
	}
}
