--- Schema

create schema jore;
alter schema jore owner to postgres;

--- Add primary keys and fix column types

ALTER TABLE jore.ak_aikataulukausi ADD PRIMARY KEY (aktunnus);
alter table jore.ak_aikataulukausi alter column akalkpvm type timestamptz using akalkpvm::timestamptz;
alter table jore.ak_aikataulukausi alter column akpaattpvm type timestamptz using akpaattpvm::timestamptz;
alter table jore.ak_aikataulukausi alter column perustpvm type timestamptz using perustpvm::timestamptz;
alter table jore.ak_aikataulukausi alter column muutospvm type timestamptz using muutospvm::timestamptz;

ALTER TABLE jore.ak_kaavio ADD PRIMARY KEY (kaaid);
ALTER TABLE jore.ak_kaavio alter column kaavoimast type timestamptz using kaavoimast::timestamptz;
ALTER TABLE jore.ak_kaavio alter column kaaviimvoi type timestamptz using kaaviimvoi::timestamptz;
ALTER TABLE jore.ak_kaavio alter column perustpvm type timestamptz using perustpvm::timestamptz;
ALTER TABLE jore.ak_kaavio alter column muutospvm type timestamptz using muutospvm::timestamptz;
ALTER TABLE jore.ak_kaavio alter column haspvtyyppi type varchar using haspvtyyppi::varchar;
ALTER TABLE jore.ak_kaavio alter column kuormaika type numeric using kuormaika::numeric;

alter table jore.ak_kaavion_lahto alter column perustpvm type timestamptz using perustpvm::timestamptz;
alter table jore.ak_kaavion_lahto alter column muutospvm type timestamptz using muutospvm::timestamptz;
alter table jore.ak_kaavion_lahto alter column kaltyyppi type varchar using kaltyyppi::varchar;
alter table jore.ak_kaavion_lahto alter column kommentti type text using kommentti::text;
alter table jore.ak_kaavion_lahto alter column voimok type varchar using voimok::varchar;
alter table jore.ak_kaavion_lahto alter column vrkvht type varchar using vrkvht::varchar;
alter table jore.ak_kaavion_lahto alter column viitem type varchar using viitem::varchar;
alter table jore.ak_kaavion_lahto alter column termaika type varchar using termaika::varchar;
alter table jore.ak_kaavion_lahto alter column elpymisaika type varchar using elpymisaika::varchar;
alter table jore.ak_kaavion_lahto alter column liitunnus type numeric using (liitunnus::text)::numeric;
alter table jore.ak_kaavion_lahto alter column lahaika type varchar using lahaika::varchar;
alter table jore.ak_kaavion_lahto alter column saapaika type varchar using saapaika::varchar;

alter table jore.ak_kaavion_suoritteet alter column perustpvm type timestamptz using perustpvm::timestamptz;
alter table jore.ak_kaavion_suoritteet alter column muutospvm type timestamptz using muutospvm::timestamptz;
alter table jore.ak_kaavion_suoritteet alter column lahaika type varchar using lahaika::varchar;

alter table jore.ak_kaavion_reitti alter column suunta1 type timestamptz using suunta1::timestamptz;
alter table jore.ak_kaavion_reitti alter column suunta2 type timestamptz using suunta2::timestamptz;

alter table jore.jr_ajoneuvo alter column tarkpvm type timestamptz using tarkpvm::timestamptz;
alter table jore.jr_ajoneuvo alter column rekpvm type timestamptz using rekpvm::timestamptz;
alter table jore.jr_ajoneuvo alter column kayttpvm type timestamptz using kayttpvm::timestamptz;
alter table jore.jr_ajoneuvo alter column voimast type timestamptz using voimast::timestamptz;
alter table jore.jr_ajoneuvo alter column viimvoi type timestamptz using viimvoi::timestamptz;
alter table jore.jr_ajoneuvo alter column tallpvm type timestamptz using tallpvm::timestamptz;
alter table jore.jr_ajoneuvo alter column valoetunro type numeric using valoetunro::numeric;

ALTER TABLE jore.jr_eritpvkalent ADD PRIMARY KEY (eritpoikpvm, eritpaiva);
alter table jore.jr_eritpvkalent alter column eritpoikpvm type timestamptz using eritpoikpvm::timestamptz;
alter table jore.jr_eritpvkalent alter column eritviimpvm type timestamptz using eritviimpvm::timestamptz;

ALTER TABLE jore.jr_inf_aikataulu_vp ADD PRIMARY KEY (id);
alter table jore.jr_inf_aikataulu_vp alter column lavoimast type timestamptz using (lavoimast::text)::timestamptz;
alter table jore.jr_inf_aikataulu_vp alter column laviimvoi type timestamptz using (laviimvoi::text)::timestamptz;
alter table jore.jr_inf_aikataulu_vp alter column laviimvoi type timestamptz using (laviimvoi::text)::timestamptz;
alter table jore.jr_inf_aikataulu_vp alter column reitunnus type varchar using reitunnus::varchar;
alter table jore.jr_inf_aikataulu_vp alter column viitem type varchar using viitem::varchar;
alter table jore.jr_inf_aikataulu_vp alter column ajotyyppi type varchar using ajotyyppi::varchar;
alter table jore.jr_inf_aikataulu_vp alter column kaltyyppi type numeric using kaltyyppi::numeric;

ALTER TABLE jore.jr_inf_eritpv ADD PRIMARY KEY (koodi);

ALTER TABLE jore.jr_inf_kohde ADD PRIMARY KEY (kohtunnus, lintunnus, liitunnus, liialkpvm, liipaattpvm);
alter table jore.jr_inf_kohde alter column kohalkpvm type timestamptz using (kohalkpvm::text)::timestamptz;
alter table jore.jr_inf_kohde alter column kohpaattpvm type timestamptz using (kohpaattpvm::text)::timestamptz;
alter table jore.jr_inf_kohde alter column liialkpvm type timestamptz using (liialkpvm::text)::timestamptz;
alter table jore.jr_inf_kohde alter column liipaattpvm type timestamptz using (liipaattpvm::text)::timestamptz;
alter table jore.jr_inf_kohde alter column liirooli type numeric using liirooli::numeric;

ALTER TABLE jore.jr_inf_liik ADD PRIMARY KEY (liitunnus);

alter table jore.jr_kilpailukohd alter column kohviimpvm type timestamptz using kohviimpvm::timestamptz;
alter table jore.jr_kilpailukohd alter column sloppupvm type timestamptz using sloppupvm::timestamptz;
alter table jore.jr_kilpailukohd alter column valtyyppi type numeric using valtyyppi::numeric;
alter table jore.jr_kilpailukohd alter column tyyppi type numeric using tyyppi::numeric;
alter table jore.jr_kilpailukohd alter column louhinkoodi type numeric using louhinkoodi::numeric;

ALTER TABLE jore.jr_liikennoitsija ADD PRIMARY KEY (liitunnus);
alter table jore.jr_liikennoitsija alter column liiviimpvm type timestamptz using (liiviimpvm::text)::timestamptz;

ALTER TABLE jore.jr_konserni ADD PRIMARY KEY (kontunnus);
alter table jore.jr_konserni alter column tallpvm type timestamptz using tallpvm::timestamptz;

alter table jore.jr_linkki alter column lnkviimpvm type timestamptz using lnkviimpvm::timestamptz;

alter table jore.jr_reitinlinkki alter column suuvoimast type timestamptz using (suuvoimast::text)::timestamptz;
alter table jore.jr_reitinlinkki alter column relviimpvm type timestamptz using (relviimpvm::text)::timestamptz;
alter table jore.jr_reitinlinkki alter column pyssade type numeric using (pyssade::text)::numeric;
alter table jore.jr_reitinlinkki alter column relmatkaik type numeric using relmatkaik::numeric;

alter table jore.jr_reitinsuunta alter column suuvoimast type timestamptz using suuvoimast::timestamptz;
alter table jore.jr_reitinsuunta alter column suuvoimviimpvm type timestamptz using suuvoimviimpvm::timestamptz;
alter table jore.jr_reitinsuunta alter column suuviimpvm type timestamptz using suuviimpvm::timestamptz;
alter table jore.jr_reitinsuunta alter column suupituus type numeric using suupituus::numeric;

--- Add indices

CREATE INDEX operator_id ON jore.jr_inf_kohde (liitunnus);
CREATE INDEX line_id ON jore.jr_inf_kohde (lintunnus);
CREATE INDEX start_date_end_date ON jore.jr_inf_kohde USING brin (kohalkpvm, kohpaattpvm);
CREATE INDEX kohtunnus_operator_line_id ON jore.jr_inf_kohde (kohtunnus, liitunnus, lintunnus);

CREATE INDEX kohtunnus ON jore.jr_kilpailukohd (kohtunnus);
CREATE INDEX seuranta ON jore.jr_kilpailukohd (seuranta);
CREATE INDEX kohtunnus_seuranta_not_null ON jore.jr_kilpailukohd (kohtunnus) WHERE seuranta IS NOT NULL;

CREATE INDEX reitunnus ON jore.ak_kaavion_lahto (reitunnus);
CREATE INDEX kaaid ON jore.ak_kaavion_lahto (kaaid);
CREATE INDEX suunta ON jore.ak_kaavion_lahto (suunta);
CREATE INDEX kaltyyppi ON jore.ak_kaavion_lahto (kaltyyppi);
CREATE INDEX liitunnus ON jore.ak_kaavion_lahto (liitunnus);

CREATE INDEX reitinsuunta_suunta ON jore.jr_reitinsuunta (suusuunta);
CREATE INDEX reitinsuunta_reitunnus ON jore.jr_reitinsuunta (reitunnus);
CREATE INDEX reitinsuunta_suupituus ON jore.jr_reitinsuunta (suupituus);

CREATE INDEX suorite_kaaid ON jore.ak_kaavion_suoritteet (kaaid);
CREATE INDEX suorite_reitti ON jore.ak_kaavion_suoritteet (reitunnus, suunta);
CREATE INDEX suorite_kaaid_reitti ON jore.ak_kaavion_suoritteet (kaaid, reitunnus, suunta);
CREATE INDEX suorite_lahaika ON jore.ak_kaavion_suoritteet (lahaika);
CREATE INDEX suorite_metrit ON jore.ak_kaavion_suoritteet (metrit);

CREATE INDEX kaavio_reitti_kaaid ON jore.ak_kaavion_reitti (kaaid);
