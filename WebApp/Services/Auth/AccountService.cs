using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace WebApp.Services.Auth;

public class AccountService : IAccountService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IDbContextFactory<ShoeStoreDbContext> _dbContextFactory;

    public AccountService(UserManager<AppUser> userManager, IDbContextFactory<ShoeStoreDbContext> dbContextFactory)
    {
        _userManager = userManager;
        _dbContextFactory = dbContextFactory;
    }

    public async Task<AuthResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto model)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new AuthResponseDto { Success = false, Message = "User not found" };
        }
        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        if (!result.Succeeded)
        {
            return new AuthResponseDto { Success = false, Message = string.Join(", ", result.Errors.Select(e => e.Description)) };
        }
        return new AuthResponseDto { Success = true, Message = "Password changed successfully" };
    }

    public async Task<AuthResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto model)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new AuthResponseDto { Success = false, Message = "User not found" };
        }
        user.PhoneNumber = model.PhoneNumber;
        user.FullName = model.FullName;
        user.Address = model.Address;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return new AuthResponseDto { Success = false, Message = string.Join(", ", result.Errors.Select(e => e.Description)) };
        }
        return new AuthResponseDto { Success = true, Message = "Profile updated successfully" };
    }

    public async Task<AuthResponseDto> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new AuthResponseDto { Success = false, Message = "User not found" };
        }
        return new AuthResponseDto { Success = true, User = await MapToUserDtoAsync(user) };
    }

    public async Task<bool> DeleteAccountAsync(string userId, string password)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        var result = await _userManager.CheckPasswordAsync(user, password);
        if (!result)
        {
            return false;
        }
        var deleteResult = await _userManager.DeleteAsync(user);
        return deleteResult.Succeeded;
    }

    public async Task<bool> LockAccountAsync(string userId, DateTime? lockoutEnd)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
        return result.Succeeded;
    }

    public async Task<bool> UnlockAccountAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        var result = await _userManager.SetLockoutEndDateAsync(user, null);
        return result.Succeeded;
    }

    public async Task<bool> DeactivateAccountAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        user.IsActive = false;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ReactivateAccountAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        user.IsActive = true;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<PaginatedList<UserDto>> FilterAndPagingUsers(int pageIndex, int pageSize, Dictionary<string, string> filter)
    {
        using var dbContext = await _dbContextFactory.CreateDbContextAsync();
        var query = dbContext.Users.AsQueryable();
        if (filter.TryGetValue("email", out var email) && !string.IsNullOrWhiteSpace(email))
            query = query.Where(u => u.Email.Contains(email));
        if (filter.TryGetValue("phoneNumber", out var phoneNumber) && !string.IsNullOrWhiteSpace(phoneNumber))
            query = query.Where(u => u.PhoneNumber.Contains(phoneNumber));
        if (filter.TryGetValue("fullName", out var fullName) && !string.IsNullOrWhiteSpace(fullName))
            query = query.Where(u => u.FullName.Contains(fullName));
        if (filter.TryGetValue("isActive", out var isActiveStr) && bool.TryParse(isActiveStr, out var isActive))
            query = query.Where(u => u.IsActive == isActive);
        var totalItems = await query.CountAsync();
        var users = await query.OrderBy(u => u.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        // Map users to DTOs outside of using block
        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                FullName = user.FullName,
                Address = user.Address,
                IsLocked = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow,
                LockoutEnd = user.LockoutEnd?.UtcDateTime,
                Roles = new List<string>() // We'll load roles separately if needed
            });
        }
        return new PaginatedList<UserDto>(userDtos, pageIndex, pageSize, totalItems);
    }

    private async Task<UserDto> MapToUserDtoAsync(AppUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            PhoneNumber = user.PhoneNumber!,
            FullName = user.FullName,
            Address = user.Address,
            IsLocked = await _userManager.IsLockedOutAsync(user),
            LockoutEnd = (await _userManager.GetLockoutEndDateAsync(user))?.UtcDateTime,
            Roles = (await _userManager.GetRolesAsync(user)).ToList()
        };
    }
} 