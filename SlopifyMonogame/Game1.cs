using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SloppyMonogame.Sloppies.Input;

namespace SloppyMonogame;

public class Game1 : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private Color _clearColor = Color.GreenYellow;
    private readonly MouseInputHandler _mouseInputHandler = new();
    private readonly KeyboardInputHandler _keyboardInputHandler = new();
    private readonly Dictionary<string, Texture2D> _textures = new();

    public Game1()
    {
        _graphics = new GraphicsDeviceManager(this);
        Content.RootDirectory = "Content";
        IsMouseVisible = true;
    }

    protected override void Initialize()
    {
        base.Initialize();
        
        IsMouseVisible = false;
    }

    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);
        _textures.Add("amogus", Content.Load<Texture2D>("Assets/Textures/amogus"));
    }

    protected override void Update(GameTime gameTime)
    {
        _mouseInputHandler.Update();
        _keyboardInputHandler.Update();

        if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed ||
            _keyboardInputHandler.IsKeyJustPressed(Keys.Escape))
            Exit();

        if (_keyboardInputHandler.IsKeyJustPressed(Keys.R))
        {
            _clearColor.R = (byte)Random.Shared.Next(256);
            _clearColor.G = (byte)Random.Shared.Next(256);
            _clearColor.B = (byte)Random.Shared.Next(256);
        }

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(_clearColor);

        _spriteBatch.Begin();
        
        _spriteBatch.Draw(_textures["amogus"], _mouseInputHandler.Position, Color.White);

        _spriteBatch.End();

        base.Draw(gameTime);
    }
    
    private Vector2 ScreenSize => new(_graphics.PreferredBackBufferWidth, _graphics.PreferredBackBufferHeight);
}