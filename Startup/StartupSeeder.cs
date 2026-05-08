using Microsoft.AspNetCore.Identity;

namespace api.Startup;

public static class StartupSeeder
{
	public static async Task SeedAsync(IServiceProvider services)
	{
		using var scope = services.CreateScope();

		var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
		var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

		// var user = await userManager.FindByEmailAsync("mvandoff@gmail.com");
		// if (user != null)
		// {
		// 	await userManager.DeleteAsync(user);
		// }
		// userManager.DeleteAsync()

		var email = config["SeedUser:Email"];
		var password = config["SeedUser:Password"];

		if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
		{
			return;
		}

		var existingUser = await userManager.FindByEmailAsync(email);
		if (existingUser is not null)
		{
			return;
		}

		var user = new IdentityUser
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
}
