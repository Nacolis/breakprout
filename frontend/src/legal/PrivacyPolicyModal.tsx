import Modal from "../ui/Modal";

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal title="Politique de confidentialité" onClose={onClose}>
      <div className="flex flex-col gap-4 text-sm text-ink">
        <section>
          <h3 className="mb-1 text-sm font-bold">Données collectées</h3>
          <p className="m-0">
            Nous collectons ton nom d'utilisateur, ton adresse e-mail, ton avatar, ainsi que
            l'historique et les statistiques de tes parties. Si tu te connectes via 42, ton
            identifiant intra (intra_id) est également stocké.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Utilisation des données</h3>
          <p className="m-0">
            Ces données servent uniquement au fonctionnement du jeu : authentification,
            affichage du profil, classement, historique des parties et fonctionnalités entre
            amis.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Conservation et cookies</h3>
          <p className="m-0">
            Un jeton de session est stocké dans ton navigateur pour te maintenir connecté(e).
            Aucune donnée n'est partagée avec des tiers ni utilisée à des fins publicitaires.
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold">Tes droits</h3>
          <p className="m-0">
            Tu peux à tout moment demander la suppression de ton compte et de tes données
            personnelles en contactant un administrateur du projet.
          </p>
        </section>
      </div>
    </Modal>
  );
}
