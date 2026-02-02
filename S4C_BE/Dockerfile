# Base stage for runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8443

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files first for better caching
COPY ["Study4Clone.slnx", "./"]
COPY ["src/Study4Clone.Api/Study4Clone.Api.csproj", "src/Study4Clone.Api/"]
COPY ["src/Study4Clone.Application/Study4Clone.Application.csproj", "src/Study4Clone.Application/"]
COPY ["src/Study4Clone.Domain/Study4Clone.Domain.csproj", "src/Study4Clone.Domain/"]
COPY ["src/Study4Clone.Infrastructure/Study4Clone.Infrastructure.csproj", "src/Study4Clone.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Study4Clone.Api/Study4Clone.Api.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/src/Study4Clone.Api"
RUN dotnet build "Study4Clone.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Study4Clone.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Study4Clone.Api.dll"]
