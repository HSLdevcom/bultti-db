create table _jore_import.ak_bultti_korvaussumma_kohde
(
    kohde varchar(12) not null,
    kuukausi date not null,
    summa numeric(20,2) not null
);

alter table _jore_import.ak_bultti_korvaussumma_kohde owner to postgres;

create index ak_bultti_korvaussumma_kohde_kohde_index
	on _jore_import.ak_bultti_korvaussumma_kohde (kohde);

create index ak_bultti_korvaussumma_kohde_kuukausi_index
	on _jore_import.ak_bultti_korvaussumma_kohde (kuukausi desc);

create table _jore_import.ak_aikataulukausi
(
    aktunnus varchar not null
        constraint ak_aikataulukausi_pkey
            primary key,
    akalkpvm date not null,
    akpaattpvm date not null,
    kausi numeric,
    aikajakso varchar,
    kommentti varchar,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone
);

alter table _jore_import.ak_aikataulukausi owner to CURRENT_USER;

create index ak_aikataulukausi_akalkpvm_akpaattpvm_index
    on _jore_import.ak_aikataulukausi (akalkpvm, akpaattpvm);

create index ak_aikataulukausi_aktunnus_index
    on _jore_import.ak_aikataulukausi (aktunnus);

create table _jore_import.ak_kaavio
(
    aktunnus varchar not null,
    kaatunnus varchar not null,
    kaavoimast date,
    pvtyyppi varchar,
    kaaversio numeric not null,
    kaaid numeric not null,
    kaaviimvoi date,
    kaanimi varchar,
    tyyppi numeric,
    aikataulupala numeric,
    kohtunnus varchar,
    kuormaika numeric,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    haspvtyyppi varchar,
    constraint ak_kaavio_pk
        primary key (aktunnus, kaaversio, kaatunnus, kaaid)
);

alter table _jore_import.ak_kaavio owner to CURRENT_USER;

create index ak_kaavio_kaaid_index
    on _jore_import.ak_kaavio (kaaid);

create index ak_kaavio_kaatunnus_index
    on _jore_import.ak_kaavio (kaatunnus);

create index ak_kaavio_kaatunnus_kaaversio_index
    on _jore_import.ak_kaavio (kaatunnus, kaaversio);

create index ak_kaavio_kaaversio_index
    on _jore_import.ak_kaavio (kaaversio);

create index ak_kaavio_kohtunnus_index
    on _jore_import.ak_kaavio (kohtunnus);

create index ak_kaavio_pvtyyppi_index
    on _jore_import.ak_kaavio (pvtyyppi);

create index ak_kaavio_kaavoimast_index
    on _jore_import.ak_kaavio (kaavoimast);

create index ak_kaavio_kaaviimvoi_index
    on _jore_import.ak_kaavio (kaaviimvoi);

create index ak_kaavio_validity_period_index
    on _jore_import.ak_kaavio (kaavoimast, kaaviimvoi);

create table _jore_import.ak_kaavion_lahto
(
    kaaid numeric not null,
    reitunnus varchar not null,
    suunta smallint not null,
    lahaika numeric(4,2) not null,
    ajoaika numeric,
    kaltyyppi varchar,
    ajotyyppi numeric,
    srtunnus varchar,
    autonumero numeric,
    kommentti text,
    voimok varchar,
    vrkvht varchar,
    viitem varchar,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    termaika numeric,
    elpymisaika numeric,
    pakollkaltyyppi boolean,
    liitunnus numeric,
    saapaika numeric(4,2),
    constraint ak_kaavion_lahto_pk
        primary key (kaaid, reitunnus, suunta, lahaika)
);

alter table _jore_import.ak_kaavion_lahto owner to CURRENT_USER;

create index reitunnus
    on _jore_import.ak_kaavion_lahto (reitunnus);

create index kaaid
    on _jore_import.ak_kaavion_lahto (kaaid);

create index kaltyyppi
    on _jore_import.ak_kaavion_lahto (kaltyyppi);

create index liitunnus
    on _jore_import.ak_kaavion_lahto (liitunnus);

create index lahto_lahtoaika
    on _jore_import.ak_kaavion_lahto (lahaika);

create index suunta
    on _jore_import.ak_kaavion_lahto (suunta);

create table _jore_import.ak_kalusto
(
    katyyppi varchar(2) not null
        constraint ak_kalusto_pk
            primary key,
    kamatlatt varchar,
    kaselite varchar(40),
    jarjnro smallint,
    perustaja varchar(8),
    perustpvm timestamp with time zone,
    muuttaja varchar(8),
    muutospvm timestamp with time zone
);

alter table _jore_import.ak_kalusto owner to CURRENT_USER;

create index ak_kalusto_katyyppi_index
    on _jore_import.ak_kalusto (katyyppi);

create table _jore_import.jr_ajoneuvo
(
    id integer,
    status varchar,
    liitunnus varchar,
    reknro varchar not null,
    kylkinro varchar not null,
    kaltyyppi varchar,
    kalluokka numeric,
    ulkoilme numeric,
    alustavalmist numeric,
    alustamalli varchar,
    korivalmist numeric,
    korimalli varchar,
    pituus numeric,
    korkeus numeric,
    polttoaine varchar,
    hybridi numeric,
    oviratkaisu varchar,
    rekpvm date not null,
    kayttpvm date,
    voimast date,
    viimvoi date,
    istumapaikat numeric,
    paastoluokka numeric,
    noxpaastot numeric,
    pmpaastot numeric,
    co2paastot numeric,
    pakokaasupuhd numeric,
    turvateli boolean,
    niiaustoiminto boolean,
    kontunnus numeric not null,
    lijlaitteet boolean,
    yliikaisyys numeric,
    constraint jr_ajoneuvo_pk
        primary key (reknro, rekpvm, kontunnus, kylkinro)
);

alter table _jore_import.jr_ajoneuvo owner to CURRENT_USER;

create index ajoneuvo_reknro
    on _jore_import.jr_ajoneuvo (reknro);

create index ajoneuvo_kylkinro
    on _jore_import.jr_ajoneuvo (kylkinro);

create index jr_ajoneuvo_kontunnus_index
    on _jore_import.jr_ajoneuvo (kontunnus);

create index jr_ajoneuvo_liitunnus_index
    on _jore_import.jr_ajoneuvo (liitunnus);

create index ajoneuvo_rekpvm
    on _jore_import.jr_ajoneuvo (rekpvm);

create table _jore_import.jr_eritpvkalent
(
    eritpoikpvm date not null,
    eritpaiva varchar not null,
    eritviikpaiva varchar,
    eriteimuita boolean,
    eritkuka varchar,
    eritviimpvm timestamp with time zone,
    eritjunat boolean,
    constraint jr_eritpvkalent_pkey
        primary key (eritpoikpvm, eritpaiva)
);

alter table _jore_import.jr_eritpvkalent owner to CURRENT_USER;

create index jr_eritpvkalent_eritpoikpvm_eritpaiva_eritviikpaiva_index
    on _jore_import.jr_eritpvkalent (eritpoikpvm, eritpaiva, eritviikpaiva);

create index jr_eritpvkalent_eritpoikpvm_index
    on _jore_import.jr_eritpvkalent (eritpoikpvm);

create table _jore_import.jr_kilpailukohd
(
    kohtunnus varchar not null,
    kohtilorg varchar,
    kohalkpvm date not null,
    kohpaattpvm date not null,
    liikaloituspvm date,
    muuttunut numeric,
    muutospvm date,
    kohnimi varchar,
    liitunnus numeric default 0 not null,
    kohtarjouspvm date,
    kohindeksipvm date,
    prosentti numeric,
    prosentti2 numeric,
    valtyyppi numeric,
    kmhinta numeric,
    tuntihinta numeric,
    pvhinta numeric,
    promraja numeric,
    ajamkerr1 numeric,
    ajamkerr2 numeric,
    ylimkerr numeric,
    kohkuka varchar,
    kohviimpvm date,
    tilnro varchar,
    ilmoitus1 numeric,
    ilmoitus2 boolean,
    selite varchar,
    perehdytys numeric,
    koulutus numeric,
    helmi numeric,
    sopimusno varchar,
    sloppupvm date,
    optiomahd numeric,
    optiokayt numeric,
    lisatietoa varchar,
    tyyppi numeric,
    sopimustyyppi varchar,
    kyssanktio1 numeric,
    kyssanktio2 numeric,
    kyssanktio3 numeric,
    seuranta numeric,
    tavoitetaso numeric,
    vertailutaso_alku numeric,
    vertailutaso_loppu numeric,
    vertailukerroin numeric,
    louhinkoodi numeric,
    constraint jr_kilpailukohd_pk
        primary key (kohtunnus, liitunnus, kohalkpvm, kohpaattpvm)
);

alter table _jore_import.jr_kilpailukohd owner to CURRENT_USER;

create index kohtunnus
    on _jore_import.jr_kilpailukohd (kohtunnus);

create index seuranta
    on _jore_import.jr_kilpailukohd (seuranta);

create index kohtunnus_seuranta_not_null
    on _jore_import.jr_kilpailukohd (kohtunnus)
    where (seuranta IS NOT NULL);

create index kohde_liitunnus
    on _jore_import.jr_kilpailukohd (liitunnus);

create table _jore_import.jr_konserni
(
    kontunnus numeric not null,
    konlyhenne varchar,
    konnimi varchar not null,
    tallpvm timestamp with time zone,
    tallentaja varchar,
    ytunnus varchar,
    status numeric,
    constraint jr_konserni_pkey
        primary key (kontunnus, konnimi)
);

alter table _jore_import.jr_konserni owner to CURRENT_USER;

create table _jore_import.jr_koodisto
(
    koolista varchar not null,
    koojarjestys numeric,
    kookoodi varchar not null,
    kooselite varchar,
    koonumero numeric,
    tyyppinumero1 numeric,
    tyyppinimi1 varchar,
    tyyppinimi2 varchar,
    koodityyppi varchar,
    constraint jr_koodisto_pk
        primary key (kookoodi, koolista)
);

alter table _jore_import.jr_koodisto owner to CURRENT_USER;

create index jr_koodisto_kookoodi_index
    on _jore_import.jr_koodisto (kookoodi);

create table _jore_import.jr_liikennoitsija
(
    liitunnus numeric not null
        constraint jr_liikennoitsija_pk
            primary key,
    liinimi varchar not null,
    liinimir varchar,
    liinimilyh varchar,
    liinimilyhr boolean,
    liiosoite varchar,
    liiposti varchar,
    liitoimittnro numeric,
    liivastapuoli numeric,
    liiptilinro varchar,
    liiytunnus varchar,
    liipankki varchar,
    liikuka varchar,
    liiviimpvm date,
    kontunnus numeric,
    liityyppi numeric,
    status numeric,
    postinumero numeric,
    postitoimipaikka varchar,
    lijliikennoitsija boolean
);

alter table _jore_import.jr_liikennoitsija owner to CURRENT_USER;

create index jr_liikennoitsija_liitunnus_index
    on _jore_import.jr_liikennoitsija (liitunnus);

create table _jore_import.jr_reitinlinkki
(
    reitunnus varchar not null,
    suusuunta smallint not null,
    suuvoimast date not null,
    reljarjnro numeric not null,
    relid numeric not null,
    relmatkaik numeric,
    relohaikpys numeric,
    relvpistaikpys varchar,
    relpysakki varchar not null,
    lnkverkko varchar not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    relkuka varchar,
    relviimpvm timestamp with time zone,
    pyssade numeric,
    ajantaspys numeric,
    liityntapys boolean,
    paikka boolean,
    kirjaan boolean,
    nettiin boolean,
    kirjasarake numeric,
    nettisarake numeric,
    constraint jr_reitinlinkki_pk
        primary key (reitunnus, suusuunta, suuvoimast, reljarjnro, relid, relpysakki, lnkverkko, lnkalkusolmu, lnkloppusolmu)
);

alter table _jore_import.jr_reitinlinkki owner to CURRENT_USER;

create index jr_reitinlinkki_reitunnus_index
    on _jore_import.jr_reitinlinkki (reitunnus);

create index jr_reitinlinkki_relpysakki_index
    on _jore_import.jr_reitinlinkki (relpysakki);

create index jr_reitinlinkki_lnkalkusolmu_index
    on _jore_import.jr_reitinlinkki (lnkalkusolmu);

create index jr_reitinlinkki_lnkloppusolmu_index
    on _jore_import.jr_reitinlinkki (lnkloppusolmu);

create index jr_reitinlinkki_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on _jore_import.jr_reitinlinkki (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create index jr_reitinlinkki_lnkalkusolmu_relpysakki_index
    on _jore_import.jr_reitinlinkki (lnkalkusolmu, relpysakki);

create index jr_reitinlinkki_suusuunta_index
    on _jore_import.jr_reitinlinkki (suusuunta);

create index jr_reitinlinkki_relpysakki_active
    on _jore_import.jr_reitinlinkki (relpysakki)
    where ((relpysakki)::text <> 'E'::text);

create index jr_reitinlinkki_lnkalkusolmu_reitunnus_index
    on _jore_import.jr_reitinlinkki (lnkalkusolmu, reitunnus);

create index jr_reitinlinkki_reitunnus_suusuunta_suuvoimast_index
    on _jore_import.jr_reitinlinkki (reitunnus, suusuunta, suuvoimast);

create index jr_reitinlinkki_reljarjnro_index
    on _jore_import.jr_reitinlinkki (reljarjnro);

create table _jore_import.jr_reitinsuunta
(
    reitunnus varchar not null,
    suusuunta smallint not null,
    suuvoimast date not null,
    suuvoimviimpvm date not null,
    suulahpaik varchar,
    suulahpaikr varchar,
    suupaapaik varchar,
    suupaapaikr varchar,
    suuensppy boolean,
    suupituus numeric,
    suukuka varchar,
    suuviimpvm date,
    suunimilyh varchar,
    suunimilyhr varchar,
    suunimi varchar,
    suunimir varchar,
    suuhis boolean,
    pyssade numeric,
    kirjaan boolean,
    nettiin boolean,
    kirjasarake numeric,
    nettisarake numeric,
    poikkeusreitti boolean,
    constraint jr_reitinsuunta_pk
        primary key (reitunnus, suusuunta, suuvoimast, suuvoimviimpvm)
);

alter table _jore_import.jr_reitinsuunta owner to CURRENT_USER;

create index reitinsuunta_reitunnus
    on _jore_import.jr_reitinsuunta (reitunnus);

create index reitinsuunta_suupituus
    on _jore_import.jr_reitinsuunta (suupituus);

create index reitinsuunta_suunta
    on _jore_import.jr_reitinsuunta (suusuunta);

create index jr_reitinsuunta_reitunnus_suusuunta_suuvoimast_suuvoimviimpvm_i
    on _jore_import.jr_reitinsuunta (reitunnus, suusuunta, suuvoimast, suuvoimviimpvm);

create index jr_reitinsuunta_suuvoimast_i
    on _jore_import.jr_reitinsuunta (suuvoimast);

create index jr_reitinsuunta_suuvoimviimpvm_i
    on _jore_import.jr_reitinsuunta (suuvoimviimpvm);

create table _jore_import.jr_linja_vaatimus
(
    lintunnus varchar not null,
    kookoodi numeric not null,
    kooselite varchar,
    constraint jr_linja_vaatimus_pk
        primary key (lintunnus, kookoodi)
);

alter table _jore_import.jr_linja_vaatimus owner to CURRENT_USER;

create index linja_vaatimus_lintunnus
    on _jore_import.jr_linja_vaatimus (lintunnus);

create table _jore_import.ak_kaavion_suoritteet
(
    kaaid numeric not null,
    reitunnus varchar not null,
    suunta smallint not null,
    lahaika numeric(4,2) not null,
    vrkvht boolean,
    autokierto numeric not null,
    kaltyyppi varchar not null,
    metrit numeric default 0 not null,
    metritsiir numeric,
    sekunnit numeric,
    sekunnitsiir numeric,
    autopv numeric,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    constraint ak_kaavion_suoritteet_pk
        primary key (kaaid, reitunnus, suunta, lahaika, autokierto, kaltyyppi)
);

alter table _jore_import.ak_kaavion_suoritteet owner to CURRENT_USER;

create index ak_kaavion_suoritteet_metrit_index
    on _jore_import.ak_kaavion_suoritteet (metrit);

create index ak_kaavion_suoritteet_reitunnus_index
    on _jore_import.ak_kaavion_suoritteet (reitunnus);

create index ak_kaavion_suoritteet_kaaid_index
    on _jore_import.ak_kaavion_suoritteet (kaaid);

create index ak_kaavion_suoritteet_reitunnus_suunta_metrit_index
    on _jore_import.ak_kaavion_suoritteet (reitunnus, suunta, metrit);

create index ak_kaavion_suoritteet_suunta_index
    on _jore_import.ak_kaavion_suoritteet (suunta);

create index suorite_kaaid_reitti_aika
    on _jore_import.ak_kaavion_suoritteet (reitunnus, suunta, lahaika, kaaid);

create table _jore_import.jr_solmu
(
    soltunnus char(7) not null
        constraint jr_solmu_pk
            primary key,
    soltyyppi char,
    sollistunnus varchar(4),
    solmapiste varchar(1),
    solx numeric(7) not null,
    soly numeric(7) not null,
    solmx numeric(8,6),
    solmy numeric(8,6),
    solkuka varchar(20),
    solviimpvm timestamp with time zone,
    solstx numeric(7),
    solsty numeric(7),
    solx3 numeric(7),
    soly3 numeric(7),
    solstx3 numeric(7),
    solsty3 numeric(7),
    solstmx numeric(8,6),
    solstmy numeric(8,6),
    solkirjain varchar(2),
    solhis varchar(1),
    solox numeric(7),
    soloy numeric(7),
    solomx numeric(8,6),
    solomy numeric(8,6),
    solotapa varchar(1),
    mittpvm timestamp with time zone,
    mkjmx numeric(8,6),
    mkjmy numeric(8,6)
);

alter table _jore_import.jr_solmu owner to CURRENT_USER;

create index jr_solmu_solsty_solstx_index
    on _jore_import.jr_solmu (solsty, solstx);

create index jr_solmu_soltunnus_index
    on _jore_import.jr_solmu (soltunnus);

create index jr_solmu_soltunnus_solsty_solstx_index
    on _jore_import.jr_solmu (soltunnus, solsty, solstx);

create index jr_solmu_soltunnus_soly_solx_index
    on _jore_import.jr_solmu (soltunnus, soly, solx);

create index jr_solmu_soly_solx_index
    on _jore_import.jr_solmu (soly, solx);

create table _jore_import.jr_reitti
(
    reitunnus varchar(6) not null
        constraint jr_reitti_pk
            primary key,
    reinimi varchar(60),
    reinimilyh varchar(20),
    reinimir varchar(60),
    reinimilyhr varchar(20),
    lintunnus varchar(6),
    reikuka varchar(20),
    reiviimpvm timestamp with time zone
);

alter table _jore_import.jr_reitti owner to CURRENT_USER;

create index jr_reitti_reitunnus_index
    on _jore_import.jr_reitti (reitunnus);

create table _jore_import.jr_pysakki
(
    soltunnus char(7) not null
        constraint jr_pysakki_pk
            primary key,
    pyskunta char(3),
    pysnimi varchar(20),
    pysnimir varchar(20),
    pyspaikannimi varchar(20),
    pyspaikannimir varchar(20),
    pysosoite varchar(20),
    pysosoiter varchar(20),
    pysvaihtopys varchar(1),
    pyskuka varchar(20),
    pysviimpvm timestamp with time zone,
    pyslaituri varchar(15),
    pyskatos varchar(2),
    pystyyppi varchar(2),
    pyssade integer,
    pyssuunta varchar(20),
    paitunnus varchar(6),
    terminaali varchar(10),
    kutsuplus varchar(1),
    kutsuplusvyo varchar(2),
    kulkusuunta varchar(20),
    kutsuplusprior varchar(2),
    id integer,
    pysalueid varchar(6),
    tariffi varchar(3),
    elynumero varchar(10),
    pysnimipitka varchar(60),
    pysnimipitkar varchar(60),
    nimiviimpvm date,
    vyohyke varchar(6),
    postinro varchar(5)
);

alter table _jore_import.jr_pysakki owner to CURRENT_USER;

create index jr_pysakki_soltunnus_index
    on _jore_import.jr_pysakki (soltunnus);

create index jr_pysakki_terminaali_index
    on _jore_import.jr_pysakki (terminaali);

create table _jore_import.jr_pysakkivali
(
    id integer not null,
    pystunnus1 char(7) not null,
    pystunnus2 char(7) not null,
    pituus integer,
    saantitapa char,
    mittauspvm timestamp with time zone,
    mitpituus integer,
    muuttaja varchar(20),
    muutospvm timestamp with time zone,
    constraint jr_pysakkivali_pk
        primary key (id, pystunnus1, pystunnus2)
);

alter table _jore_import.jr_pysakkivali owner to CURRENT_USER;

create index jr_pysakkivali_pystunnus1_pystunnus2_index
    on _jore_import.jr_pysakkivali (pystunnus1, pystunnus2);

create table _jore_import.jr_linja
(
    lintunnus varchar(6) not null
        constraint jr_linja_pk
            primary key,
    linperusreitti varchar(6),
    linvoimast date,
    linvoimviimpvm date,
    linjoukkollaji varchar(2) not null,
    lintilorg varchar(3),
    linverkko varchar(1),
    linryhma varchar(3),
    linkuka varchar(20),
    linviimpvm timestamp with time zone,
    linjlkohde varchar(6),
    id varchar(4),
    vaihtoaika integer,
    linkorvtyyppi varchar(2),
    puhelinnumero varchar(20)
);

alter table _jore_import.jr_linja owner to CURRENT_USER;

create index jr_linja_linjoukkollaji_index
    on _jore_import.jr_linja (linjoukkollaji);

create index jr_linja_lintunnus_index
    on _jore_import.jr_linja (lintunnus);

create index jr_linja_lintunnus_linvoimast_linvoimviimpvm_index
    on _jore_import.jr_linja (lintunnus, linvoimast, linvoimviimpvm);

create table _jore_import.jr_korvpvkalent
(
    korvpoikpvm date not null,
    korvpaiva char(2) not null,
    korvjoukkollaji char(2) not null,
    korvviikpaiva char(2) not null,
    korvalkaika numeric(4,2),
    korvpaataika numeric(4,2),
    korvkuka varchar(20),
    korvviimpvm timestamp with time zone,
    constraint jr_korvpvkalent_pk
        primary key (korvpoikpvm, korvpaiva, korvjoukkollaji, korvviikpaiva)
);

alter table _jore_import.jr_korvpvkalent owner to CURRENT_USER;

create index jr_korvpvkalent_korvjoukkollaji_index
    on _jore_import.jr_korvpvkalent (korvjoukkollaji);

create index jr_korvpvkalent_korvpaiva_index
    on _jore_import.jr_korvpvkalent (korvpaiva);

create index jr_korvpvkalent_korvpoikpvm_index
    on _jore_import.jr_korvpvkalent (korvpoikpvm);

create table _jore_import.jr_valipisteaika
(
    reitunnus varchar not null,
    lavoimast date not null,
    lhpaivat char(2) not null,
    lhsuunta smallint not null,
    lhvrkvht char not null,
    lhlahaik numeric(4,2) not null,
    vastunnus varchar not null,
    vaslaika numeric(4,2) not null,
    vaslvrkvht char not null,
    vasjarjnro smallint,
    vaskuka varchar(20),
    vasviimpvm timestamp with time zone,
    vaslahde varchar(2),
    vastaika numeric(4,2),
    vastvrkvht char,
    raide char(3),
    constraint jr_valipisteaika_pk
        primary key (reitunnus, lavoimast, lhpaivat, lhsuunta, lhvrkvht, lhlahaik, vastunnus, vaslaika, vaslvrkvht)
);

alter table _jore_import.jr_valipisteaika owner to CURRENT_USER;

create index jr_valipisteaika_lavoimast_index
    on _jore_import.jr_valipisteaika (lavoimast);

create index jr_valipisteaika_lhlahaik_index
    on _jore_import.jr_valipisteaika (lhlahaik);

create index jr_valipisteaika_lhpaivat_index
    on _jore_import.jr_valipisteaika (lhpaivat);

create index jr_valipisteaika_reitunnus_index
    on _jore_import.jr_valipisteaika (reitunnus);

create index jr_valipisteaika_reitunnus_lhsuunta_lhlahaik_lhpaivat_lavoimast
    on _jore_import.jr_valipisteaika (reitunnus, lhsuunta, lhlahaik, lhpaivat, lavoimast, lhvrkvht);

create index jr_valipisteaika_lhsuunta_index
    on _jore_import.jr_valipisteaika (lhsuunta);

create index jr_valipisteaika_vastunnus_index
    on _jore_import.jr_valipisteaika (vastunnus);


create table _jore_import.jr_aikataulu
(
    reitunnus varchar not null,
    lavoimast date not null,
    laviimvoi date not null,
    lakuka varchar(20),
    laviimpvm timestamp with time zone,
    constraint jr_aikataulu_pk
        primary key (reitunnus, lavoimast, laviimvoi)
);

alter table _jore_import.jr_aikataulu owner to CURRENT_USER;

create index jr_aikataulu_lavoimast_laviimvoi_index
    on _jore_import.jr_aikataulu (lavoimast, laviimvoi);

create index jr_aikataulu_reitunnus_index
    on _jore_import.jr_aikataulu (reitunnus);

create table _jore_import.jr_liik_kilpa_suhde
(
    liitunnus varchar(6) not null,
    kohtunnus varchar(12) not null,
    liirooli varchar(2),
    liialkpvm timestamp with time zone,
    liipaattpvm timestamp with time zone,
    constraint jr_liik_kilpa_suhde_pk
        primary key (liitunnus, kohtunnus)
);

alter table _jore_import.jr_liik_kilpa_suhde owner to CURRENT_USER;

create index jr_liik_kilpa_suhde_kohtunnus_index
    on _jore_import.jr_liik_kilpa_suhde (kohtunnus);

create index jr_liik_kilpa_suhde_liitunnus_index
    on _jore_import.jr_liik_kilpa_suhde (liitunnus);
