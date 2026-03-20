# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# copy csproj trước (optimize cache)
COPY ProductAPI/ProductAPI.csproj ./ProductAPI/
RUN dotnet restore ./ProductAPI/ProductAPI.csproj

# copy toàn bộ code
COPY . .

WORKDIR /app/ProductAPI
RUN dotnet publish ProductAPI.csproj -c Release -o out --no-restore
# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/ProductAPI/out .
ENTRYPOINT ["dotnet", "ProductAPI.dll"]