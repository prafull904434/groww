### FinBoard

FinBoard is a simple finance dashboard. The idea was to create a clean and flexible dashboard where users can view stock market data using configurable widgets.

The project mainly focuses on frontend architecture, UI/UX, and basic API integration.

## About the Project
- Frontend-focused implementation
- Uses public stock APIs
- Emphasis on usability and clean code rather than advanced infrastructure
  
## Deployment
Check out the live project here: [FinBoard Live](https://groww-obih53dir-prafull-singhs-projects-a78482a6.vercel.app/)

## Features
### Dashboard
- Add and remove widgets
- Drag and drop widgets to rearrange layout
- Resize widgets as needed

### Widgets
- Charts (line and candlestick)
- Tables with basic search

### Configuration
- Change widget titles
- Select stock symbol and time interval
- Map API response fields to UI
- Basic data formatting (number, currency, date)

### Data Handling
- Stock data fetched using Alpha Vantage
- Simple caching to reduce API calls
- Loading and error states handled properly

### UI
- Built with Tailwind CSS
- Light and dark theme support
- Responsive layout for different screen sizes

### Persistence
- Widget layout and settings saved in localStorage
- Dashboard restores on page refresh
- Export and import dashboard configuration as JSON

## Screenshots
![Screenshot 1](screenshot/Screenshot-2025-12-27-103413.png)
![Screenshot 2](screenshot/Screenshot-2025-12-27-103520.png)
![Screenshot 3](screenshot/Screenshot-2025-12-27-103543.png)
![Screenshot 4](screenshot/Screenshot-2025-12-27-103833.png)



## Flow
```
finboard/
├── src/
│   ├── app/           
│   │   ├── layout.tsx       
│   │   ├── page.tsx        
│   │   └── globals.css     
│   ├── components/         
│   │   ├── Dashboard.tsx   
│   │   ├── AddWidgetModal.tsx
│   │   ├── WidgetConfig.tsx
│   │   └── widgets/         
│   │       ├── ChartWidget.tsx
│   │       ├── TableWidget.tsx
│   │       └── CardWidget.tsx
│   ├── contexts/           
│   │   └── ThemeContext.tsx
│   ├── hooks/              
│   │   └── useStockData.ts
│   ├── services/           
│   │   └── stockApi.ts
│   ├── store/              
│   │   ├── store.ts
│   │   └── widgetsSlice.ts
│   ├── types/             
│   │   └── widget.ts
│   └── utils/              
│       └── formatters.ts
├── public/                 
├── .env.local              
└── package.json
```

## Tech Stack
- Next.js 16
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Recharts
- react-grid-layout

## Getting Started

### Requirements
- Node.js 18+

### Setup
```
git clone https://github.com/prafull904434/groww.git
cd finboard
npm install
```

