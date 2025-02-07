using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework.Input;

namespace SloppyMonogame.Sloppies.Input;

public class KeyboardInputHandler
{
    private readonly HashSet<Keys> _heldKeys = [];
    private HashSet<Keys> _previousKeys = [];

    public void Update()
    {
        _previousKeys = [.._heldKeys];
        _heldKeys.Clear();

        var keyboardState = Keyboard.GetState();
        _heldKeys.UnionWith(keyboardState.GetPressedKeys());
    }

    public bool IsKeyDown(Keys key) => _heldKeys.Contains(key);

    public bool IsKeyJustPressed(Keys key) => _heldKeys.Contains(key) && !_previousKeys.Contains(key);

    public bool IsKeyJustReleased(Keys key) => !_heldKeys.Contains(key) && _previousKeys.Contains(key);
}