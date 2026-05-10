namespace api.Data.Sql;

public interface ISqlFileReader<TAnchor>
{
	Task<string> ReadAsync(string queryName, CancellationToken cancellationToken = default);
}

public sealed class SqlFileReader<TAnchor> : ISqlFileReader<TAnchor>
{
	public Task<string> ReadAsync(string queryName, CancellationToken cancellationToken = default)
	{
		var anchorNamespace = typeof(TAnchor).Namespace
			?? throw new InvalidOperationException($"{typeof(TAnchor).Name} must have a namespace to locate SQL files.");

		const string dataNamespace = ".Data.";
		var dataNamespaceIndex = anchorNamespace.IndexOf(dataNamespace, StringComparison.Ordinal);

		if (dataNamespaceIndex < 0)
		{
			throw new InvalidOperationException($"{typeof(TAnchor).FullName} must be under a Data namespace to locate SQL files.");
		}

		var dataRelativeNamespace = anchorNamespace[(dataNamespaceIndex + dataNamespace.Length)..];
		var dataRelativePath = dataRelativeNamespace.Replace('.', Path.DirectorySeparatorChar);
		var fileName = queryName.EndsWith(".sql", StringComparison.OrdinalIgnoreCase)
			? queryName
			: $"{queryName}.sql";

		var sqlPath = Path.Combine(AppContext.BaseDirectory, "Data", dataRelativePath, "Sql", fileName);
		return File.ReadAllTextAsync(sqlPath, cancellationToken);
	}
}
