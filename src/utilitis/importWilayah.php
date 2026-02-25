<?php

$host = "localhost";
$user = "root";
$pass = "1234";
$db   = "study_tracer";

$conn = new mysqli($host,$user,$pass,$db);

if ($conn->connect_error) {
    die("Koneksi gagal: ".$conn->connect_error);
}

$conn->set_charset("utf8mb4");

echo "Start Import...<br>";

$provinsi_json = file_get_contents("https://wilayah.id/api/provinces.json");
$provinsis = json_decode($provinsi_json,true);

$provinsiValues = [];

foreach($provinsis as $p){

    $code = $conn->real_escape_string($p['code']);
    $name = $conn->real_escape_string($p['name']);

    $provinsiValues[] = "('$code','$name',NOW(),NOW())";
}

$sql = "INSERT INTO provinsis (code,nama_provinsi,created_at,updated_at)
VALUES ".implode(",",$provinsiValues)."
ON DUPLICATE KEY UPDATE
nama_provinsi = VALUES(nama_provinsi)";

$conn->query($sql);

echo "Provinsi imported <br>";

$map = [];
$result = $conn->query("SELECT id,code FROM provinsis");

while($row = $result->fetch_assoc()){
    $map[$row['code']] = $row['id'];
}


$kotaValues = [];

foreach($provinsis as $p){

    $codeProv = $p['code'];

    echo "Fetch kota provinsi ".$p['name']."<br>";

    $kota_json = file_get_contents("https://wilayah.id/api/regencies/$codeProv.json");
    $kotas = json_decode($kota_json,true);

    foreach($kotas as $k){

        $code = $conn->real_escape_string($k['code']);
        $name = $conn->real_escape_string($k['name']);
        $idProv = $map[$codeProv];

        $kotaValues[] = "('$code','$name',$idProv,NOW(),NOW())";
    }
}

$sql = "INSERT INTO kotas (code,nama_kota,id_provinsi,created_at,updated_at)
VALUES ".implode(",",$kotaValues)."
ON DUPLICATE KEY UPDATE
nama_kota = VALUES(nama_kota),
id_provinsi = VALUES(id_provinsi)";

$conn->query($sql);

echo "<br>SELESAI IMPORT 🚀";
