var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços de controllers
builder.Services.AddControllers();

var app = builder.Build();

// Usa HTTPS em dev
app.UseHttpsRedirection();

// Mapeia controllers
app.MapControllers();

app.Run();
