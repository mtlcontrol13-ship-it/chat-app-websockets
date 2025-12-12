# Chat Application Class Diagram

```mermaid
classDiagram
    %% Backend Models
    class User {
        +ObjectId _id
        +String email
        +String userName
        +String role
        +String companyId
        +ObjectId assignedTo
        +Date firstChatJoinAt
        +Date createdAt
        +Date updatedAt
        +save()
        +findById()
        +findOne()
    }

    class Message {
        +String id
        +ObjectId senderId
        +String senderUsername
        +ObjectId recipientId
        +String text
        +String type
        +Boolean edited
        +Boolean seen
        +Date seenAt
        +Date timestamp
        +Date createdAt
        +Date updatedAt
        +save()
        +find()
    }

    %% Backend Controllers
    class AuthController {
        +login(req, res)
        +register(req, res)
    }

    %% Backend WebSocket
    class WebSocketServer {
        +Map connectedUsers
        +broadcast(data)
        +sendToRecipient(data, recipientId)
        +broadcastParticipants()
        +handleConnection(ws)
        +handleMessage(ws, data)
        +handleIdentify(ws, msg)
        +handleIndividualMessage(ws, msg)
        +handleDisconnect(ws)
        +loadMessageHistory(userId)
    }

    %% Frontend Context
    class ChatContext {
        +Object user
        +Array messages
        +Array companyParticipants
        +String input
        +Boolean isConnected
        +String username
        +String editingId
        +String editingText
        +login(email)
        +register(email, userName, role)
        +logout()
        +sendMessage(e, participantId)
        +startEditingMessage(msg)
        +deleteMessage(msg)
        +saveEdit()
        +cancelEditing()
    }

    class useWebSocketChat {
        +Array messages
        +String input
        +Boolean isConnected
        +String username
        +Array participants
        +Number latencyMs
        +WebSocket socketRef
        +sendMessage(e, participantId)
        +sendIdentify(name, userId)
        +startEditingMessage(msg)
        +deleteMessage(msg)
        +saveEdit()
        +cancelEditing()
    }

    %% Frontend Components
    class App {
        +Boolean isSidebarOpen
        +setIsSidebarOpen()
        +render()
    }

    class Sidebar {
        +Array contactList
        +Function onClose
        +Boolean isOpen
        +navigate(participantId)
        +filterParticipants()
        +render()
    }

    class ChatView {
        +String participantId
        +Object participant
        +Function onChatOpen
        +render()
    }

    class MessageList {
        +String participantId
        +Array participantMessages
        +filterMessages()
        +render()
    }

    class MessageInput {
        +String participantId
        +String input
        +handleSubmit()
        +render()
    }

    class ChatBubble {
        +String text
        +String time
        +Boolean isOwn
        +Boolean edited
        +Boolean seen
        +Boolean isEditing
        +render()
    }

    class Header {
        +String username
        +Number participantCount
        +render()
    }

    class Modal {
        +Boolean isOpen
        +Function onClose
        +String title
        +render()
    }

    %% Frontend API
    class AuthAPI {
        +login(email)
        +register(email, userName, role)
    }

    %% Relationships
    User "1" --> "0..*" Message : sends
    User "1" --> "0..*" Message : receives
    User "1" --> "0..1" User : assignedTo
    User "1" --> "0..*" User : hasDrivers
    
    Message "0..*" --> "1" User : sender
    Message "0..*" --> "1" User : recipient

    WebSocketServer ..> User : queries
    WebSocketServer ..> Message : stores/retrieves
    WebSocketServer --> Message : persists
    
    AuthController ..> User : manages

    App *-- Sidebar : contains
    App *-- ChatView : contains
    ChatView *-- MessageList : contains
    ChatView *-- MessageInput : contains
    MessageList *-- ChatBubble : contains
    App *-- Header : contains
    
    ChatContext --> useWebSocketChat : uses
    ChatContext --> AuthAPI : uses
    
    Sidebar ..> ChatContext : consumes
    ChatView ..> ChatContext : consumes
    MessageList ..> ChatContext : consumes
    MessageInput ..> ChatContext : consumes
    Header ..> ChatContext : consumes
    
    useWebSocketChat --> WebSocketServer : connects to
    AuthAPI --> AuthController : calls

    note for User "Role: admin, driver, customer\nCompanyId: UUID for organization\nAssignedTo: For driver-customer pairing"
    note for Message "Real-time and persisted messages\nFiltered by participantId\nSupports edit, delete, seen status"
    note for WebSocketServer "Handles real-time messaging\nPersists messages to database\nLoads message history on connect"
    note for ChatContext "Global state management\nProvides auth and messaging\nWraps entire application"
```

## Architecture Overview

### Backend Layer
- **Models**: MongoDB schemas for User and Message entities
- **Controllers**: Handle HTTP requests for authentication
- **WebSocket Server**: Manages real-time communication and message persistence
- **Database**: MongoDB with Mongoose ODM

### Frontend Layer
- **Context**: React Context API for global state management
- **Hooks**: Custom hooks for WebSocket and theme management
- **Components**: Reusable UI components
- **Routing**: React Router for individual chat navigation

### Key Features
1. **Individual 1-on-1 Chats**: Route-based conversations using participant IDs
2. **Message Persistence**: All messages stored in MongoDB
3. **Real-time Communication**: WebSocket for instant message delivery
4. **Message History**: Loaded when user connects
5. **Role-based Access**: Admin, driver, and customer roles
6. **Company Organization**: Users grouped by company UUID
7. **Driver-Customer Assignment**: Drivers assigned to specific customers
