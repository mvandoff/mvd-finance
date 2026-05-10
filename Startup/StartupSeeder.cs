using Api.Data.Users;
using Microsoft.AspNetCore.Identity;

namespace Api.Startup;

public static class StartupSeeder
{
	public static async Task SeedAsync(IServiceProvider services)
	{
		using var scope = services.CreateScope();

		var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
		var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
		var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();

		var email = config["SeedUser:Email"];
		var password = config["SeedUser:Password"];
		var name = config["SeedUser:Name"];

		if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(name))
		{
			return;
		}

		var user = await userManager.FindByEmailAsync(email);
		if (user is null)
		{
			user = new IdentityUser
			{
				UserName = email,
				Email = email,
			};

			var result = await userManager.CreateAsync(user, password);

			if (!result.Succeeded)
			{
				var errors = string.Join(", ", result.Errors.Select(e => e.Description));
				throw new InvalidOperationException($"Failed to seed initial user: {errors}");
			}
		}

		await userRepository.CreateIfMissingAsync(email, name, user.Id);
	}
}
