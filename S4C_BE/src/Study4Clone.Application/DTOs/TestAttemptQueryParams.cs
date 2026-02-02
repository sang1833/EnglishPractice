namespace Study4Clone.Application.DTOs;

public record TestAttemptQueryParams
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public string? SortOrder { get; init; } = "desc"; // "asc" or "desc"
}
