import Modal from "../ui/Modal";

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export default function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  return (
    <Modal title="Conditions d'utilisation" onClose={onClose}>
      <div className="flex flex-col gap-4 text-sm text-ink">
        <section>
          <h3 className="mb-1 text-sm font-bold">Objet</h3>
          <p className="m-0">
            Breakprout est un jeu de plateau en ligne développé dans un cadre pédagogique. En
            créant un compte, tu acceptes les présentes conditions d'utilisation.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Compte utilisateur</h3>
          <p className="m-0">
            Tu es responsable de la confidentialité de tes identifiants et de toute activité
            réalisée depuis ton compte.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Comportement attendu</h3>
          <p className="m-0">
            Toute tentative de triche, d'exploitation de faille ou de comportement abusif
            envers d'autres joueurs peut entraîner la suspension ou la suppression du compte.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Disponibilité du service</h3>
          <p className="m-0">
            Le service est fourni "en l'état", sans garantie de disponibilité continue. Les
            parties en cours peuvent être interrompues en cas de maintenance.
          </p>
        </section>
      </div>
    </Modal>
  );
}
