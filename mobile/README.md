# Mobile App (Flutter)

Este directorio esta reservado para tu app Flutter.

## Inicializacion

```bash
flutter create .
```

## Estructura sugerida

```text
lib/
|-- core/
|-- features/
|-- shared/
`-- main.dart
```

## Recomendacion

- Usa `flutter_dotenv` para definir `API_BASE_URL` por entorno.
- Integra autenticacion JWT contra el backend Django.
