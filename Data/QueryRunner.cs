using Dapper;
using Npgsql;

namespace Api.Data;

/// <summary>
/// Runs SQL files through Dapper for a repository/data area anchored by <typeparamref name="TAnchor"/>.
/// The anchor type determines where <see cref="ISqlFileReader{TAnchor}"/> looks for query files.
/// </summary>
public interface IQueryRunner<TAnchor>
{
	/// <summary>
	/// Runs a command that does not return mapped rows, such as an INSERT, UPDATE, DELETE, or DDL statement.
	/// </summary>
	Task<int> ExecuteAsync(string queryName, object? parameters = null, CancellationToken cancellationToken = default);

	/// <summary>
	/// Runs a query that may return zero or more rows.
	/// </summary>
	Task<IReadOnlyList<T>> QueryAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);

	/// <summary>
	/// Runs a query that must return exactly one row.
	/// </summary>
	Task<T> QuerySingleAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);

	/// <summary>
	/// Runs a query that must return zero or one row.
	/// </summary>
	Task<T?> QuerySingleOrDefaultAsync<T>(string queryName, object? parameters = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Small Dapper adapter that keeps repositories focused on query names and parameters.
/// Each call opens and disposes its own pooled database connection.
/// </summary>
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
		// Dapper's simpler overloads do not all expose cancellation, so route calls through CommandDefinition.
		return new CommandDefinition(sql, parameters, cancellationToken: cancellationToken);
	}
}
