<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBlTable extends Migration
{
    public function up()
    {
        Schema::create('bl', function (Blueprint $table) {
            $table->id();
            $table->string('numero_bl')->unique();
            $table->date('date_bl');
            $table->foreignId('camion_id')->constrained('camions')->onDelete('restrict');
            $table->foreignId('chauffeur_id')->constrained('chauffeurs')->onDelete('restrict');
            $table->foreignId('client_id')->constrained('clients')->onDelete('restrict');
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('restrict');
            $table->foreignId('transporteur_id')->constrained('transporteurs')->onDelete('restrict');
            $table->enum('produit', ['Essence', 'Gasoil']);
            $table->decimal('quantite', 12, 2); // Litres
            $table->decimal('prix_transport', 15, 2)->default(0);
            $table->date('date_livraison')->nullable();
            $table->date('date_liquidation')->nullable();
            $table->enum('statut', ['En cours', 'Livré', 'Liquidé', 'Annulé'])->default('En cours');
            $table->text('observation')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bl');
    }
}
