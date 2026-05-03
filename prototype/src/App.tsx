import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Timeline from './pages/Timeline';
import Vault from './pages/Vault';
import ContractDetail from './pages/Contract';
import Procurement from './pages/Procurement';
import Legal from './pages/Legal';
import Executive from './pages/Executive';
import Compare from './pages/Compare';
import Review from './pages/Review';

/** Remount detail view when :id changes so tab state resets without an effect. */
function ContractRoute() {
  const { id } = useParams();
  return <ContractDetail key={id ?? ''} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Obligation Timeline is the new home */}
          <Route index element={<Navigate to="/timeline" replace />} />

          {/* Core */}
          <Route path="timeline" element={<Timeline />} />
          <Route path="vault" element={<Vault />} />
          <Route path="contract/:id" element={<ContractRoute />} />

          {/* Persona surfaces */}
          <Route path="procurement" element={<Procurement />} />
          <Route path="legal" element={<Legal />} />
          <Route path="executive" element={<Executive />} />

          {/* Cross-cutting */}
          <Route path="compare" element={<Compare />} />
          <Route path="review" element={<Review />} />

          <Route path="*" element={<Navigate to="/timeline" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
