using Npgsql;

namespace Api.Data;

public interface ISqlCommandFactory<TAnchor>
{
	Task<NpgsqlCommand> CreateAsync(string queryName, CancellationToken cancellationToken = default);
}

public sealed class SqlCommandFactory<TAnchor> : ISqlCommandFactory<TAnchor>
{
	private readonly NpgsqlDataSource _dataSource;
	private readonly ISqlFileReader<TAnchor> _sqlFileReader;

	public SqlCommandFactory(NpgsqlDataSource dataSource, ISqlFileReader<TAnchor> sqlFileReader)
	{
		_dataSource = dataSource;
		_sqlFileReader = sqlFileReader;
	}

	public async Task<NpgsqlCommand> CreateAsync(string queryName, CancellationToken cancellationToken = default)
	{
		string sql = await _sqlFileReader.ReadAsync(queryName, cancellationToken);
		return _dataSource.CreateCommand(sql);
	}
}
