using Api.Auth;
using Api.Data;
using Api.Data.Users;
using Api.Startup;

using Dapper;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Npgsql;

using Scalar.AspNetCore;
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddIdentity<IdentityUser, IdentityRole>(
    options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 1;
        options.Password.RequiredUniqueChars = 0;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    }
)
    .AddEntityFrameworkStores<AuthDbContext>();


string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));

// Open generic registrations let repositories request SQL helpers anchored to their own folder.
builder.Services.AddSingleton(typeof(ISqlFileReader<>), typeof(SqlFileReader<>));
builder.Services.AddSingleton(typeof(IQueryRunner<>), typeof(QueryRunner<>));

builder.Services.AddScoped<IUserRepository, UserRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    await StartupSeeder.SeedAsync(app.Services);
}

app.Run();
