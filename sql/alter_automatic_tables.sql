--- Schema

create schema jore;
alter schema jore owner to postgres;

--- Add primary keys and fix column types

ALTER TABLE jore.ak_aikataulukausi ADD PRIMARY KEY (aktunnus);
alter table jore.ak_aikataulukausi alter column akalkpvm type date using akalkpvm::date;
alter table jore.ak_aikataulukausi alter column akpaattpvm type date using akpaattpvm::date;
alter table jore.ak_aikataulukausi alter column perustpvm type date using perustpvm::date;
alter table jore.ak_aikataulukausi alter column muutospvm type date using muutospvm::date;

ALTER TABLE jore.ak_kaavio ADD PRIMARY KEY (kaaid);
ALTER TABLE jore.ak_kaavio alter column kaavoimast type date using kaavoimast::date;
ALTER TABLE jore.ak_kaavio alter column kaaviimvoi type date using kaaviimvoi::date;
ALTER TABLE jore.ak_kaavio alter column perustpvm type date using perustpvm::date;
ALTER TABLE jore.ak_kaavio alter column muutospvm type date using muutospvm::date;
ALTER TABLE jore.ak_kaavio alter column haspvtyyppi type varchar using haspvtyyppi::varchar;
ALTER TABLE jore.ak_kaavio alter column kuormaika type numeric using kuormaika::numeric;

alter table jore.ak_kaavion_lahto alter column perustpvm type date using perustpvm::date;
alter table jore.ak_kaavion_lahto alter column muutospvm type date using muutospvm::date;
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

alter table jore.ak_kaavion_suoritteet alter column perustpvm type date using perustpvm::date;
alter table jore.ak_kaavion_suoritteet alter column muutospvm type date using muutospvm::date;
alter table jore.ak_kaavion_suoritteet alter column lahaika type varchar using lahaika::varchar;

alter table jore.ak_kaavion_reitti alter column suunta1 type date using suunta1::date;
alter table jore.ak_kaavion_reitti alter column suunta2 type date using suunta2::date;

alter table jore.jr_ajoneuvo alter column tarkpvm type date using tarkpvm::date;
alter table jore.jr_ajoneuvo alter column rekpvm type date using rekpvm::date;
alter table jore.jr_ajoneuvo alter column kayttpvm type date using kayttpvm::date;
alter table jore.jr_ajoneuvo alter column voimast type date using voimast::date;
alter table jore.jr_ajoneuvo alter column viimvoi type date using viimvoi::date;
alter table jore.jr_ajoneuvo alter column tallpvm type timestamptz using tallpvm::timestamptz;
alter table jore.jr_ajoneuvo alter column valoetunro type numeric using valoetunro::numeric;

ALTER TABLE jore.jr_kinf_kalusto ADD PRIMARY KEY (reknro, kylkinro, liitunnus);
alter table jore.jr_kinf_kalusto alter column kylkinro type varchar using kylkinro::varchar;

ALTER TABLE jore.jr_eritpvkalent ADD PRIMARY KEY (eritpoikpvm, eritpaiva);
alter table jore.jr_eritpvkalent alter column eritpoikpvm type date using eritpoikpvm::date;
alter table jore.jr_eritpvkalent alter column eritviimpvm type date using eritviimpvm::date;

ALTER TABLE jore.jr_inf_aikataulu_vp ADD PRIMARY KEY (id);
alter table jore.jr_inf_aikataulu_vp alter column lavoimast type date using (lavoimast::text)::date;
alter table jore.jr_inf_aikataulu_vp alter column laviimvoi type date using (laviimvoi::text)::date;
alter table jore.jr_inf_aikataulu_vp alter column laviimvoi type date using (laviimvoi::text)::date;
alter table jore.jr_inf_aikataulu_vp alter column reitunnus type varchar using reitunnus::varchar;
alter table jore.jr_inf_aikataulu_vp alter column viitem type varchar using viitem::varchar;
alter table jore.jr_inf_aikataulu_vp alter column ajotyyppi type varchar using ajotyyppi::varchar;
alter table jore.jr_inf_aikataulu_vp alter column kaltyyppi type numeric using kaltyyppi::numeric;

ALTER TABLE jore.jr_inf_eritpv ADD PRIMARY KEY (koodi);

ALTER TABLE jore.jr_inf_kohde ADD PRIMARY KEY (kohtunnus, lintunnus, liitunnus, liialkpvm, liipaattpvm);
alter table jore.jr_inf_kohde alter column kohalkpvm type date using (kohalkpvm::text)::date;
alter table jore.jr_inf_kohde alter column kohpaattpvm type date using (kohpaattpvm::text)::date;
alter table jore.jr_inf_kohde alter column liialkpvm type date using (liialkpvm::text)::date;
alter table jore.jr_inf_kohde alter column liipaattpvm type date using (liipaattpvm::text)::date;
alter table jore.jr_inf_kohde alter column liirooli type numeric using liirooli::numeric;

ALTER TABLE jore.jr_inf_liik ADD PRIMARY KEY (liitunnus);

alter table jore.jr_kilpailukohd alter column kohviimpvm type date using kohviimpvm::date;
alter table jore.jr_kilpailukohd alter column sloppupvm type date using sloppupvm::date;
alter table jore.jr_kilpailukohd alter column valtyyppi type numeric using valtyyppi::numeric;
alter table jore.jr_kilpailukohd alter column tyyppi type numeric using tyyppi::numeric;
alter table jore.jr_kilpailukohd alter column louhinkoodi type numeric using louhinkoodi::numeric;

ALTER TABLE jore.jr_liikennoitsija ADD PRIMARY KEY (liitunnus);
alter table jore.jr_liikennoitsija alter column liiviimpvm type date using (liiviimpvm::text)::date;

ALTER TABLE jore.jr_konserni ADD PRIMARY KEY (kontunnus);
alter table jore.jr_konserni alter column tallpvm type timestamptz using tallpvm::timestamptz;

alter table jore.jr_linkki alter column lnkviimpvm type timestamptz using lnkviimpvm::timestamptz;

alter table jore.jr_reitinlinkki alter column suuvoimast type date using (suuvoimast::text)::date;
alter table jore.jr_reitinlinkki alter column relviimpvm type date using (relviimpvm::text)::date;
alter table jore.jr_reitinlinkki alter column pyssade type numeric using (pyssade::text)::numeric;
alter table jore.jr_reitinlinkki alter column relmatkaik type numeric using relmatkaik::numeric;

alter table jore.jr_reitinsuunta alter column suuvoimast type date using suuvoimast::date;
alter table jore.jr_reitinsuunta alter column suuvoimviimpvm type date using suuvoimviimpvm::date;
alter table jore.jr_reitinsuunta alter column suuviimpvm type date using suuviimpvm::date;
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

CREATE INDEX ajoneuvo_reknro ON jore.jr_ajoneuvo (reknro);
CREATE INDEX ajoneuvo_rekpvm ON jore.jr_ajoneuvo (rekpvm);
CREATE INDEX ajoneuvo_kylkinro ON jore.jr_ajoneuvo (kylkinro);

CREATE INDEX kalusto_reknro ON jore.jr_kinf_kalusto (reknro);
CREATE INDEX kalusto_liitunnus ON jore.jr_kinf_kalusto (liitunnus);
CREATE INDEX kalusto_kylkinro ON jore.jr_kinf_kalusto (kylkinro);
CREATE INDEX kalusto_tyyppi ON jore.jr_kinf_kalusto (tyyppi);
CREATE INDEX kalusto_paastoluokka ON jore.jr_kinf_kalusto (paastoluokka);
