using System;
using Confirma.Enums;
using Godot;
using static System.AttributeTargets;

namespace Confirma.Attributes;

[AttributeUsage(Class | Method, AllowMultiple = false)]
public class IgnoreAttribute : Attribute
{
    public EIgnoreMode Mode { get; init; }
    public string? Reason { get; init; }

    public IgnoreAttribute(EIgnoreMode mode = EIgnoreMode.Always, string? reason = null)
    {
        Mode = mode;
        Reason = string.IsNullOrEmpty(reason) ? null : reason;
    }

    public bool IsIgnored()
    {
        return Mode switch
        {
            EIgnoreMode.Always => true,
            EIgnoreMode.InEditor => Engine.IsEditorHint(),
            _ => false
        };
    }
}
