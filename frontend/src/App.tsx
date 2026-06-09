import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/AnimatedRoutes';

export default function App() {
    return (
        <Router>
            <AnimatedRoutes />
        </Router>
    );
}