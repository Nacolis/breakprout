import Modal from "../ui/Modal";

interface RulesModalProps {
  onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <Modal title="Règles du jeu" onClose={onClose}>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-ink">
        <li>Chaque joueur possède deux rangées de pions sur son camp.</li>
        <li>
          Un pion avance d'une case tout droit uniquement si la case est libre, ou en diagonale
          si la case est libre ou occupée par un pion adverse (capture).
        </li>
        <li>Il est impossible de capturer un pion en avançant tout droit.</li>
        <li>Le premier joueur à atteindre la rangée opposée avec un pion gagne la partie.</li>
        <li>Un joueur gagne aussi s'il capture tous les pions adverses.</li>
      </ul>
    </Modal>
  );
}
