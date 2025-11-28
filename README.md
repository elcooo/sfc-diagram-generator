# SFC Diagram Generator

A web-based Sequential Function Chart (SFC) diagram generator that converts SCL (Structured Control Language) code into interactive visual diagrams.

## Features

- 🎨 **Interactive Diagram Editor**: Visualize SFC diagrams with steps, transitions, actions, and conditions
- ✏️ **Editable Labels**: Double-click any node label to edit it in place
- 🔄 **Real-time Generation**: Convert SCL code to diagrams instantly
- 🎯 **Drag & Drop**: Rearrange nodes by dragging them
- 📏 **Resizable Nodes**: Select and resize nodes to fit your needs
- 🔍 **Zoom Controls**: Zoom in/out and fit view to canvas
- 📖 **Syntax Guide**: Built-in help system with SCL syntax examples
- 🌙 **Dark Theme**: Modern, sleek dark interface

## SCL Syntax

The parser supports the following SCL constructs:

### Basic Sequence
```
STEP Init
TRANSITION T1
STEP Process
```

### Actions & Conditions
```
STEP Process
ACTION Run=1
TRANSITION T1
CONDITION Temp>50
```

### Branching (OR)
```
STEP S1
TRANSITION T1
STEP S2

TRANSITION T2 FROM S1
STEP S3
```

### Jumps
```
JUMP Init
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sfc-diagram-generator.git
cd sfc-diagram-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Enter SCL Code**: Type or paste your SCL code in the left panel
2. **Generate Diagram**: Click the "Run" button to generate the diagram
3. **Edit Nodes**: Double-click any label to edit it
4. **Resize Nodes**: Select a node and drag the resize handles
5. **Rearrange Layout**: Drag nodes to adjust the layout
6. **View Help**: Click the "?" button for syntax examples

## Technologies Used

- **React** - UI framework
- **ReactFlow** - Diagram rendering and interaction
- **Vite** - Build tool and dev server
- **Dagre** - Graph layout algorithm
- **Lucide React** - Icons

## Project Structure

```
sfc/
├── src/
│   ├── components/
│   │   ├── StepNode.jsx          # Step node component
│   │   ├── TransitionNode.jsx    # Transition node component
│   │   └── EditableLabel.jsx     # Editable label component
│   ├── utils/
│   │   └── sclParser.js          # SCL parser and layout logic
│   ├── App.jsx                   # Main application component
│   ├── App.css                   # Application styles
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
├── package.json
└── vite.config.js
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
