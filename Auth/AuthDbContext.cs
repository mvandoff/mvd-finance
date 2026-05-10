using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Auth;

public class AuthDbContext : IdentityDbContext<IdentityUser>
{
	public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
	{

	}
}
