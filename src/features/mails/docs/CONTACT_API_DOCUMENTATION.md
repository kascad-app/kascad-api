# API Contact - Documentation

Cette API permet aux sponsors d'envoyer des emails aux riders et de consulter l'historique de leurs messages.

## 📋 Table des matières

- [Authentification](#authentification)
- [Routes disponibles](#routes-disponibles)
  - [POST /contact/send-one](#post-contactsend-one)
  - [GET /contact/sponsor-messages](#get-contactsponsor-messages)
- [Schémas de données](#schémas-de-données)
- [Codes d'erreur](#codes-derreur)

## 🔐 Authentification

Toutes les routes nécessitent une authentification JWT via cookie `access-token`.

## 🛣️ Routes disponibles

### POST /contact/send-one

Envoie un email à un rider et enregistre le message en base de données.

#### Endpoint

```
POST /contact/send-one
```

#### Body (JSON)

```json
{
  "email": {
    "name": "string",
    "toEmail": "string (email format)",
    "subject": "string",
    "message": "string"
  },
  "riderId": "string (MongoDB ObjectId)"
}
```

#### Exemple de requête

```javascript
const response = await fetch("/contact/send-one", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Important pour envoyer les cookies
  body: JSON.stringify({
    email: {
      name: "Kascad Team",
      toEmail: "rider@example.com",
      subject: "Proposition de partenariat",
      message: "Bonjour, nous aimerions vous proposer un partenariat...",
    },
    riderId: "60d5ecb54b24a1234567890a",
  }),
});
```

#### Réponse en cas de succès (201)

```json
{
  "id": "email-id-from-resend",
  "from": "Kascad Team <info@kascad.fr>",
  "to": ["rider@example.com"],
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Flux de traitement

1. ✅ Validation de l'authentification du sponsor
2. ✅ Sauvegarde du message en base avec statut `"sent"`
3. ✅ Envoi de l'email via Resend
4. ✅ Mise à jour du statut à `"delivered"` si succès
5. ❌ Mise à jour du statut à `"failed"` si échec d'envoi

---

### GET /contact/sponsor-messages

Récupère l'historique des messages envoyés par le sponsor authentifié.

#### Endpoint

```
GET /contact/sponsor-messages
```

#### Headers requis

```
Cookie: access-token=your-jwt-token
```

#### Exemple de requête

```javascript
const response = await fetch("/contact/sponsor-messages", {
  method: "GET",
  credentials: "include", // Important pour envoyer les cookies
});
```

#### Réponse en cas de succès (200)

```json
{
  "messages": [
    {
      "_id": "60d5ecb54b24a1234567890b",
      "sponsorId": "60d5ecb54b24a1234567890c",
      "riderId": {
        "_id": "60d5ecb54b24a1234567890a",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "subject": "Proposition de partenariat",
      "message": "Bonjour, nous aimerions vous proposer...",
      "senderEmail": "info@kascad.fr",
      "recipientEmail": "john.doe@example.com",
      "senderName": "Kascad Team",
      "recipientName": "John Doe",
      "status": "delivered",
      "sentAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:05Z"
    }
  ],
  "total": 1
}
```

## 📊 Schémas de données

### SponsorMessage (Document MongoDB)

```typescript
{
  _id: ObjectId,                    // ID unique du message
  sponsorId: ObjectId,              // ID du sponsor expéditeur
  riderId: ObjectId,                // ID du rider destinataire
  subject: string,                  // Sujet de l'email
  message: string,                  // Contenu du message
  senderEmail: string,              // Email de l'expéditeur (toujours "info@kascad.fr")
  recipientEmail: string,           // Email du destinataire
  senderName: string,               // Nom de l'expéditeur
  recipientName: string,            // Nom du destinataire
  status: "sent" | "delivered" | "failed", // Statut du message
  sentAt: Date,                     // Date d'envoi
  createdAt: Date,                  // Date de création
  updatedAt: Date                   // Date de dernière modification
}
```

### Statuts possibles

- **`sent`** : Message sauvegardé, envoi en cours
- **`delivered`** : Email envoyé avec succès
- **`failed`** : Échec de l'envoi de l'email

## ⚠️ Codes d'erreur

### Erreurs d'authentification

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Erreurs de validation

```json
// 400 Bad Request
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email.toEmail",
      "message": "Invalid email format"
    }
  ]
}
```

### Erreurs de sauvegarde

```json
// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Failed to save message. Email not sent."
}
```

### Erreurs d'envoi d'email

```json
// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Failed to send email. Message saved with failed status."
}
```

## 🔧 Utilisation avec différents clients

### cURL

```bash
# Envoi d'un email
curl -X POST 'https://api.kascad.fr/contact/send-one' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: access-token=your-jwt-token' \
  -d '{
    "email": {
      "name": "Kascad Team",
      "toEmail": "rider@example.com",
      "subject": "Proposition de partenariat",
      "message": "Bonjour..."
    },
    "riderId": "60d5ecb54b24a1234567890a"
  }'

# Récupération des messages
curl -X GET 'https://api.kascad.fr/contact/sponsor-messages' \
  -H 'Cookie: access-token=your-jwt-token'
```

### JavaScript/TypeScript

```typescript
// Définition des types
interface ContactEmail {
  email: {
    name: string;
    toEmail: string;
    subject: string;
    message: string;
  };
  riderId: string;
}

interface SponsorMessage {
  _id: string;
  sponsorId: string;
  riderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: string;
  message: string;
  status: "sent" | "delivered" | "failed";
  sentAt: string;
}

// Service class exemple
class ContactService {
  private baseUrl = "https://api.kascad.fr";

  async sendEmail(data: ContactEmail): Promise<any> {
    const response = await fetch(`${this.baseUrl}/contact/send-one`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return response.json();
  }

  async getMessages(): Promise<{ messages: SponsorMessage[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/contact/sponsor-messages`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## 📝 Notes importantes

1. **Authentification obligatoire** : Toutes les routes nécessitent un token JWT valide
2. **Sauvegarde avant envoi** : Les messages sont toujours sauvegardés avant l'envoi
3. **Gestion des erreurs** : Les statuts permettent de traquer les échecs d'envoi
4. **Population automatique** : Les données du rider sont automatiquement populées dans la réponse
5. **Email source** : Tous les emails sont envoyés depuis `info@kascad.fr`
6. **Sécurité** : Seuls les sponsors peuvent envoyer des emails et voir leurs propres messages
