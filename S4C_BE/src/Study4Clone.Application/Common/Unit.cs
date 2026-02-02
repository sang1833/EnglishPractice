namespace Study4Clone.Application.Common;

/// <summary>
/// Represents a void type, since 'void' is not a valid type parameter in C#.
/// </summary>
public struct Unit
{
    public static readonly Unit Value = new();
}
