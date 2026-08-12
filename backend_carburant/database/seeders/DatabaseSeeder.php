<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Transporteur;
use App\Models\Camion;
use App\Models\Chauffeur;
use App\Models\Client;
use App\Models\Destination;
use App\Models\Bl;
use App\Models\ActivityLog;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Administrateur Principal',
            'email' => 'admin@carburant.gn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        ]);

        $exploitation = User::create([
            'name' => 'Agent d\'Exploitation',
            'email' => 'exploitation@carburant.gn',
            'password' => Hash::make('password'),
            'role' => 'exploitation',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        ]);

        $consultation = User::create([
            'name' => 'Agent Consultation',
            'email' => 'consultation@carburant.gn',
            'password' => Hash::make('password'),
            'role' => 'consultation',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        ]);

        // 2. Transporteurs
        $t1 = Transporteur::create([
            'nom' => 'SOGIP CARBURANTS S.A.',
            'responsable' => 'Mamadou Camara',
            'telephone' => '+224 622 10 20 30',
            'adresse' => 'Km 14, Zone Industrielle Matoto, Conakry',
        ]);

        $t2 = Transporteur::create([
            'nom' => 'KANKAN LOGISTIQUE SARL',
            'responsable' => 'Ibrahima Sory Diallo',
            'telephone' => '+224 620 55 66 77',
            'adresse' => 'Quartier Missiran, Kankan',
        ]);

        $t3 = Transporteur::create([
            'nom' => 'SAHEL TRANSPORT PETROLE',
            'responsable' => 'Ousmane Barry',
            'telephone' => '+224 628 33 44 55',
            'adresse' => 'Port Autonome, Conakry',
        ]);

        $t4 = Transporteur::create([
            'nom' => 'GUINÉE PETROLE TRANSPORT',
            'responsable' => 'Fodé Soumah',
            'telephone' => '+224 625 99 88 77',
            'adresse' => 'Dubréka KM 5',
        ]);

        // 3. Destinations
        $d1 = Destination::create(['nom' => 'SGP Kankan', 'region' => 'Kankan', 'distance' => 660]);
        $d2 = Destination::create(['nom' => 'Komarala', 'region' => 'Kankan', 'distance' => 620]);
        $d3 = Destination::create(['nom' => 'Doko', 'region' => 'Siguiri', 'distance' => 780]);
        $d4 = Destination::create(['nom' => 'Missiran', 'region' => 'Kankan', 'distance' => 640]);
        $d5 = Destination::create(['nom' => 'Mamou Depot', 'region' => 'Mamou', 'distance' => 270]);
        $d6 = Destination::create(['nom' => 'Kouroussa Centre', 'region' => 'Kouroussa', 'distance' => 580]);
        $d7 = Destination::create(['nom' => 'Kansikeren', 'region' => 'Mandiana', 'distance' => 740]);

        // 4. Clients
        $c1 = Client::create(['nom' => 'Mohamed Diallo', 'telephone' => '+224 622 11 22 33', 'adresse' => 'Kankan Commercial', 'contact' => 'Mohamed Diallo']);
        $c2 = Client::create(['nom' => 'Sow Fadiya', 'telephone' => '+224 620 44 55 66', 'adresse' => 'Doko Station Total', 'contact' => 'Fadiya Sow']);
        $c3 = Client::create(['nom' => 'Guilavogui Enterprise', 'telephone' => '+224 628 77 88 99', 'adresse' => 'Mamou Gare', 'contact' => 'Jean Guilavogui']);
        $c4 = Client::create(['nom' => 'Société Minière de Doko', 'telephone' => '+224 625 00 11 22', 'adresse' => 'Zone Minière Doko', 'contact' => 'Directeur Logistique']);
        $c5 = Client::create(['nom' => 'Kouroussa Petroleum', 'telephone' => '+224 621 33 22 11', 'adresse' => 'Quartier Administratif, Kouroussa', 'contact' => 'Mory Kouyaté']);

        // 5. Chauffeurs
        $ch1 = Chauffeur::create(['nom' => 'Abdoulaye Bah', 'telephone' => '+224 622 01 02 03', 'numero_permis' => 'PRM-GN-88492', 'expiration_permis' => '2028-10-15', 'transporteur_id' => $t1->id]);
        $ch2 = Chauffeur::create(['nom' => 'Alpha Oumar Diallo', 'telephone' => '+224 620 14 15 16', 'numero_permis' => 'PRM-GN-19402', 'expiration_permis' => '2027-05-20', 'transporteur_id' => $t1->id]);
        $ch3 = Chauffeur::create(['nom' => 'Sekou Condé', 'telephone' => '+224 628 30 31 32', 'numero_permis' => 'PRM-GN-66401', 'expiration_permis' => '2029-01-10', 'transporteur_id' => $t2->id]);
        $ch4 = Chauffeur::create(['nom' => 'Morlaye Camara', 'telephone' => '+224 625 70 71 72', 'numero_permis' => 'PRM-GN-45129', 'expiration_permis' => '2026-12-30', 'transporteur_id' => $t3->id]);
        $ch5 = Chauffeur::create(['nom' => 'Lansana Keita', 'telephone' => '+224 621 90 91 92', 'numero_permis' => 'PRM-GN-33019', 'expiration_permis' => '2028-08-18', 'transporteur_id' => $t4->id]);

        // 6. Camions
        $cam1 = Camion::create(['immatriculation' => 'GN-5684-C', 'marque' => 'Scania R450', 'capacite' => 45000, 'type_citerne' => 'Aluminium 3 Compartiments', 'transporteur_id' => $t1->id, 'etat' => 'Actif', 'date_assurance' => '2027-02-15', 'date_visite' => '2026-11-20']);
        $cam2 = Camion::create(['immatriculation' => 'GN-9120-B', 'marque' => 'Volvo FH16', 'capacite' => 45000, 'type_citerne' => 'Acier Inoxydable', 'transporteur_id' => $t1->id, 'etat' => 'Actif', 'date_assurance' => '2027-04-10', 'date_visite' => '2026-12-05']);
        $cam3 = Camion::create(['immatriculation' => 'GN-3411-D', 'marque' => 'Mercedes Actros', 'capacite' => 38000, 'type_citerne' => 'Aluminium', 'transporteur_id' => $t2->id, 'etat' => 'Actif', 'date_assurance' => '2026-09-30', 'date_visite' => '2026-10-15']);
        $cam4 = Camion::create(['immatriculation' => 'GN-7750-A', 'marque' => 'MAN TGX', 'capacite' => 45000, 'type_citerne' => 'Acier Inoxydable', 'transporteur_id' => $t3->id, 'etat' => 'Actif', 'date_assurance' => '2027-01-25', 'date_visite' => '2026-11-01']);
        $cam5 = Camion::create(['immatriculation' => 'GN-1209-E', 'marque' => 'Renault Trucks T', 'capacite' => 40000, 'type_citerne' => 'Aluminium', 'transporteur_id' => $t4->id, 'etat' => 'En maintenance', 'date_assurance' => '2026-08-10', 'date_visite' => '2026-08-25']);

        // 7. Bons de Livraison (BL)
        $blsData = [
            ['num' => 'BL-2026-1490', 'date' => '2026-07-28', 'cam' => $cam1->id, 'chf' => $ch1->id, 'cli' => $c1->id, 'dst' => $d1->id, 'trp' => $t1->id, 'prd' => 'Essence', 'qty' => 45000, 'px' => 4500000, 'st' => 'Liquidé', 'dlv' => '2026-07-25', 'liq' => '2026-07-28'],
            ['num' => 'BL-2026-1489', 'date' => '2026-07-27', 'cam' => $cam2->id, 'chf' => $ch2->id, 'cli' => $c2->id, 'dst' => $d3->id, 'trp' => $t1->id, 'prd' => 'Gasoil', 'qty' => 45000, 'px' => 4800000, 'st' => 'Liquidé', 'dlv' => '2026-07-26', 'liq' => '2026-07-27'],
            ['num' => 'BL-2026-1488', 'date' => '2026-07-26', 'cam' => $cam3->id, 'chf' => $ch3->id, 'cli' => $c3->id, 'dst' => $d5->id, 'trp' => $t2->id, 'prd' => 'Gasoil', 'qty' => 38000, 'px' => 3200000, 'st' => 'Liquidé', 'dlv' => '2026-07-25', 'liq' => '2026-07-26'],
            ['num' => 'BL-2026-1487', 'date' => '2026-07-25', 'cam' => $cam4->id, 'chf' => $ch4->id, 'cli' => $c4->id, 'dst' => $d3->id, 'trp' => $t3->id, 'prd' => 'Essence', 'qty' => 45000, 'px' => 4900000, 'st' => 'Liquidé', 'dlv' => '2026-07-24', 'liq' => '2026-07-25'],
            ['num' => 'BL-2026-1486', 'date' => '2026-07-24', 'cam' => $cam1->id, 'chf' => $ch1->id, 'cli' => $c1->id, 'dst' => $d2->id, 'trp' => $t1->id, 'prd' => 'Essence', 'qty' => 45000, 'px' => 4400000, 'st' => 'Livré', 'dlv' => '2026-07-27', 'liq' => null],
            ['num' => 'BL-2026-1485', 'date' => '2026-07-24', 'cam' => $cam2->id, 'chf' => $ch2->id, 'cli' => $c5->id, 'dst' => $d6->id, 'trp' => $t1->id, 'prd' => 'Gasoil', 'qty' => 45000, 'px' => 4200000, 'st' => 'Livré', 'dlv' => '2026-07-26', 'liq' => null],
            ['num' => 'BL-2026-1484', 'date' => '2026-07-23', 'cam' => $cam3->id, 'chf' => $ch3->id, 'cli' => $c2->id, 'dst' => $d3->id, 'trp' => $t2->id, 'prd' => 'Gasoil', 'qty' => 38000, 'px' => 4600000, 'st' => 'En cours', 'dlv' => null, 'liq' => null],
            ['num' => 'BL-2026-1483', 'date' => '2026-07-22', 'cam' => $cam4->id, 'chf' => $ch4->id, 'cli' => $c1->id, 'dst' => $d1->id, 'trp' => $t3->id, 'prd' => 'Essence', 'qty' => 45000, 'px' => 4500000, 'st' => 'En cours', 'dlv' => null, 'liq' => null],
            ['num' => 'BL-2026-1482', 'date' => '2026-07-21', 'cam' => $cam5->id, 'chf' => $ch5->id, 'cli' => $c4->id, 'dst' => $d7->id, 'trp' => $t4->id, 'prd' => 'Gasoil', 'qty' => 40000, 'px' => 4700000, 'st' => 'En cours', 'dlv' => null, 'liq' => null],
            ['num' => 'BL-2026-1481', 'date' => '2026-07-20', 'cam' => $cam1->id, 'chf' => $ch1->id, 'cli' => $c3->id, 'dst' => $d5->id, 'trp' => $t1->id, 'prd' => 'Essence', 'qty' => 45000, 'px' => 3100000, 'st' => 'Liquidé', 'dlv' => '2026-07-21', 'liq' => '2026-07-23'],
        ];

        foreach ($blsData as $b) {
            Bl::create([
                'numero_bl' => $b['num'],
                'date_bl' => $b['date'],
                'camion_id' => $b['cam'],
                'chauffeur_id' => $b['chf'],
                'client_id' => $b['cli'],
                'destination_id' => $b['dst'],
                'transporteur_id' => $b['trp'],
                'produit' => $b['prd'],
                'quantite' => $b['qty'],
                'prix_transport' => $b['px'],
                'statut' => $b['st'],
                'date_livraison' => $b['dlv'],
                'date_liquidation' => $b['liq'],
                'observation' => 'Livraison conforme selon protocole de chargement dépôt Dépôt Central Conakry.',
                'created_by' => $exploitation->id,
            ]);
        }

        // 8. Logs
        ActivityLog::create([
            'user_id' => $admin->id,
            'user_name' => $admin->name . ' (admin)',
            'action' => 'INITIALIZATION',
            'table_name' => 'system',
            'record_id' => null,
            'details' => 'Initialisation de la base de données de gestion des BL de carburants.',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
