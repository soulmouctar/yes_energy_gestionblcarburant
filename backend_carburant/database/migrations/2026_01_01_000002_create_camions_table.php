<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCamionsTable extends Migration
{
    public function up()
    {
        Schema::create('camions', function (Blueprint $table) {
            $table->id();
            $table->string('immatriculation')->unique();
            $table->string('marque')->nullable();
            $table->decimal('capacite', 12, 2)->default(45000); // Litres
            $table->string('type_citerne')->nullable()->default('Acier');
            $table->foreignId('transporteur_id')->constrained('transporteurs')->onDelete('cascade');
            $table->string('etat')->default('Actif'); // Actif, En panne, En maintenance
            $table->date('date_assurance')->nullable();
            $table->date('date_visite')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('camions');
    }
}
