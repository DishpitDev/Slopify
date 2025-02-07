using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
using SloppyMonogame.Sloppies.Enums;

namespace SloppyMonogame.Sloppies.Input;

public class MouseInputHandler
{
    private readonly HashSet<MouseButton> _heldMouseButtons = [];
    private HashSet<MouseButton> _previousMouseButtons = [];
    public Vector2 PreviousPosition { get; private set; }
    public Vector2 Position { get; private set; }

    public void Update()
    {
        _previousMouseButtons = [.._heldMouseButtons];
        _heldMouseButtons.Clear();

        var mouseState = Mouse.GetState();

        PreviousPosition = Position;
        Position = mouseState.Position.ToVector2();

        if (mouseState.LeftButton == ButtonState.Pressed)
        {
            _heldMouseButtons.Add(MouseButton.Left);
        }

        if (mouseState.MiddleButton == ButtonState.Pressed)
        {
            _heldMouseButtons.Add(MouseButton.Middle);
        }

        if (mouseState.RightButton == ButtonState.Pressed)
        {
            _heldMouseButtons.Add(MouseButton.Right);
        }

        if (mouseState.XButton1 == ButtonState.Pressed)
        {
            _heldMouseButtons.Add(MouseButton.XButton1);
        }

        if (mouseState.XButton2 == ButtonState.Pressed)
        {
            _heldMouseButtons.Add(MouseButton.XButton2);
        }
    }

    public bool IsMouseButtonDown(MouseButton button) => _heldMouseButtons.Contains(button);

    public bool IsMouseButtonPressed(MouseButton button) =>
        _heldMouseButtons.Contains(button) && !_previousMouseButtons.Contains(button);

    public bool IsMouseButtonReleased(MouseButton button) =>
        !_heldMouseButtons.Contains(button) && _previousMouseButtons.Contains(button);

    public bool IsMouseMoving() => Position != PreviousPosition;

    public float GetTravelDistance() => Vector2.Distance(Position, PreviousPosition);
    
    public Vector2 PositionDifference => Position - PreviousPosition;
}