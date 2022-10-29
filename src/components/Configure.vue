<template>
  <v-container>
    <v-toolbar color="primary" cards dark flat>
      <v-card-title class="title font-weight-regular"> Settings </v-card-title>
    </v-toolbar>
    <v-form ref="form" class="pa-4 pt-6">
      <v-tabs>
        <v-tab :key="1">Validation</v-tab>
        <v-tab-item :key="1">
          <v-card flat>
            <v-select
              v-model="VALIDATION_WORKSHEET"
              :items="worksheets"
              label="WORKSHEET"
              @change="onChangeValidationWorksheet($event)"
              :rules="[(v) => !!v || 'Selecione uma opção.']"
            ></v-select>
            <v-select
              v-model="VALIDATION_DATASOURCE_TO_REFRESH"
              :items="validation_datasources"
              label="DATASOURCE_TO_REFRESH"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="VALIDATION_USER_FIELD"
              :items="validation_fields"
              label="USER"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="VALIDATION_SISE_KEY_FIELD"
              :items="validation_fields"
              label="SISE_KEY"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="VALIDATION_AUTOMATED_RESULT_FIELD"
              :items="validation_fields"
              label="AUTOMATED_RESULT"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="VALIDATION_COVERAGE_ID_FIELD"
              :items="validation_fields"
              label="COVERAGE_ID"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="VALIDATION_VALIDATION_ID_FIELD"
              :items="validation_fields"
              label="VALIDATION_ID"
              :rules="rules"
            ></v-select>
          </v-card>
        </v-tab-item>
        <v-tab :key="2">Manual Validation</v-tab>
        <v-tab-item :key="2">
          <v-card flat>
            <v-select
              v-model="MANUAL_REVIEW_WORKSHEET"
              :items="worksheets"
              label="WORKSHEET"
              @change="onChangeValidationWorksheet($event)"
              :rules="[(v) => !!v || 'Selecione uma opção.']"
            ></v-select>
            <v-select
              v-model="MANUAL_REVIEW_DATASOURCE"
              :items="validation_datasources"
              label="DATASOURCE_TO_REFRESH"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="MANUAL_REVIEW_USER"
              :items="validation_fields"
              label="USER"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="MANUAL_REVIEW_SISE_KEY"
              :items="validation_fields"
              label="SISE_KEY"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="MANUAL_REVIEW_VERIFICATION"
              :items="validation_fields"
              label="VERIFICATION"
              :rules="rules"
            ></v-select>

            <v-select
              v-model="MANUAL_REVIEW_VALIDATION_ID"
              :items="validation_fields"
              label="VALIDATION_ID"
              :rules="rules"
            ></v-select>
          </v-card>
        </v-tab-item>

        <v-tab :key="3">Leakage</v-tab>
        <v-tab-item :key="3">
          <v-card flat>
            <v-select
              v-model="LEAKAGE_WORKSHEET"
              :items="worksheets"
              label="LEAKAGE_WORKSHEET"
              :rules="[(v) => !!v || 'Selecione uma opção.']"
              @change="onChangeLeakageWorksheet($event)"
            ></v-select>
            <v-select
              v-model="LEAKAGE_DATASOURCE_TO_REFRESH"
              :items="leakage_datasources"
              label="LEAKAGE_DATASOURCE_TO_REFRESH"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="LEAKAGE_USER_FIELD"
              :items="leakage_fields"
              label="USER"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="LEAKAGE_SISE_KEY_FIELD"
              :items="leakage_fields"
              label="SISE_KEY"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="LEAKAGE_COVERAGE_ID_FIELD"
              :items="leakage_fields"
              label="COVERAGE_ID"
              :rules="rules"
            ></v-select>
            <v-select
              v-model="LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD"
              :items="leakage_fields"
              label="CALCULATED_LEAKAGE_VALUE"
              :rules="rules"
            ></v-select>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-form>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn text @click="closeDialog()"> Cancelar </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="white--text" color="primary" @click="saveDialog()"> Salvar </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Processando...
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import axios from "axios";
import bus from "../utils/bus";
import config from "../utils/config";

export default {
  data() {
    return {
      worksheets: [],
      leakage_fields: [],
      validation_fields: [],
      leakage_datasources: [],
      validation_datasources: [],
      LEAKAGE_WORKSHEET: "",
      LEAKAGE_DATASOURCE_TO_REFRESH: "",
      LEAKAGE_USER_FIELD: "",
      LEAKAGE_SISE_KEY_FIELD: "",
      LEAKAGE_COVERAGE_ID_FIELD: "",
      LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD: "",
      VALIDATION_WORKSHEET: "",
      VALIDATION_DATASOURCE_TO_REFRESH: "",
      VALIDATION_USER_FIELD: "",
      VALIDATION_SISE_KEY_FIELD: "",
      VALIDATION_AUTOMATED_RESULT_FIELD: "",
      VALIDATION_COVERAGE_ID_FIELD: "",
      VALIDATION_VALIDATION_ID_FIELD: "",

      MANUAL_REVIEW_WORKSHEET: "",
      MANUAL_REVIEW_DATASOURCE: "",
      MANUAL_REVIEW_USER: "",
      MANUAL_REVIEW_SISE_KEY: "",
      MANUAL_REVIEW_VERIFICATION: "",
      MANUAL_REVIEW_VALIDATION_ID: "",

      dialog: false,
      rules: [(v) => v != "" || "Selecione uma opção."],
    };
  },
  methods: {
    onChangeValidationWorksheet($event) {
      let ref = this;
      this.dialog = true;
      console.log(this.VALIDATION_WORKSHEET);
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === this.VALIDATION_WORKSHEET
      );
      worksheet
        .getUnderlyingTablesAsync()
        .then(function (logicalTables) {
          worksheet.getUnderlyingTableDataAsync(logicalTables[0].id).then((dataTable) => {
            ref.validation_fields = dataTable.columns.map((col) => col.fieldName);
            worksheet.getDataSourcesAsync().then((datasources) => {
              ref.validation_datasources = datasources.map((ds) => ds.name);
              ref.dialog = false;
            });
          });
        })
        .catch((error) => {
          ref.dialog = false;
        });
    },
    onChangeLeakageWorksheet($event) {
      let ref = this;
      this.dialog = true;
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === this.LEAKAGE_WORKSHEET
      );
      console.log(worksheet);
      worksheet
        .getSummaryDataAsync()
        .then(function (dataTable) {
          //carrega o nome dos campos
          console.log(dataTable);
          ref.leakage_fields = dataTable.columns.map((col) => {
            let field_name = col.fieldName;
            if (field_name.includes("(")) {
              return field_name.substring(
                field_name.indexOf("(") + 1,
                field_name.length - 1
              );
            }
            return col.fieldName;
          });
          //carrega a lista de datasources
          worksheet.getDataSourcesAsync().then((datasources) => {
            ref.leakage_datasources = datasources.map((ds) => ds.name);
            ref.dialog = false;
          });
        })
        .catch((error) => {
          ref.dialog = false;
        });
    },
    getFieldListFromDataSource() {
      let ref = this;
      console.log(this.LEAKAGE_WORKSHEET);
      this.dialog = true;
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === this.LEAKAGE_WORKSHEET
      );
      worksheet
        .getUnderlyingTablesAsync()
        .then(function (logicalTables) {
          worksheet.getUnderlyingTableDataAsync(logicalTables[0].id).then((dataTable) => {
            //carrega o nome dos campos
            ref.leakage_fields = dataTable.columns.map((col) => col.fieldName);
            //carrega a lista de datasources
            worksheet.getDataSourcesAsync().then((datasources) => {
              ref.leakage_datasources = datasources.map((ds) => ds.name);
              ref.dialog = false;
            });
          });
        })
        .catch((error) => {
          ref.dialog = false;
        });
    },
    closeDialog() {
      tableau.extensions.ui.closeDialog();
    },
    saveDialog() {
      if (this.$refs.form.validate()) {
        //atualiza as configurações
        tableau.extensions.settings.set("LEAKAGE_WORKSHEET", this.LEAKAGE_WORKSHEET);
        tableau.extensions.settings.set(
          "LEAKAGE_DATASOURCE_TO_REFRESH",
          this.LEAKAGE_DATASOURCE_TO_REFRESH
        );
        tableau.extensions.settings.set("LEAKAGE_USER_FIELD", this.LEAKAGE_USER_FIELD);
        tableau.extensions.settings.set(
          "LEAKAGE_SISE_KEY_FIELD",
          this.LEAKAGE_SISE_KEY_FIELD
        );
        tableau.extensions.settings.set(
          "LEAKAGE_COVERAGE_ID_FIELD",
          this.LEAKAGE_COVERAGE_ID_FIELD
        );
        tableau.extensions.settings.set(
          "LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD",
          this.LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD
        );
        tableau.extensions.settings.set(
          "leakage_fields",
          JSON.stringify(this.leakage_fields)
        );
        tableau.extensions.settings.set(
          "leakage_datasources",
          JSON.stringify(this.leakage_datasources)
        );

        tableau.extensions.settings.set(
          "VALIDATION_WORKSHEET",
          this.VALIDATION_WORKSHEET
        );
        tableau.extensions.settings.set(
          "VALIDATION_DATASOURCE_TO_REFRESH",
          this.VALIDATION_DATASOURCE_TO_REFRESH
        );
        tableau.extensions.settings.set(
          "VALIDATION_USER_FIELD",
          this.VALIDATION_USER_FIELD
        );
        tableau.extensions.settings.set(
          "VALIDATION_SISE_KEY_FIELD",
          this.VALIDATION_SISE_KEY_FIELD
        );
        tableau.extensions.settings.set(
          "VALIDATION_AUTOMATED_RESULT_FIELD",
          this.VALIDATION_AUTOMATED_RESULT_FIELD
        );
        tableau.extensions.settings.set(
          "VALIDATION_COVERAGE_ID_FIELD",
          this.VALIDATION_COVERAGE_ID_FIELD
        );
        tableau.extensions.settings.set(
          "VALIDATION_VALIDATION_ID_FIELD",
          this.VALIDATION_VALIDATION_ID_FIELD
        );
        tableau.extensions.settings.set(
          "validation_fields",
          JSON.stringify(this.validation_fields)
        );
        tableau.extensions.settings.set(
          "validation_datasources",
          JSON.stringify(this.validation_datasources)
        );

        tableau.extensions.settings.set(
          "MANUAL_REVIEW_WORKSHEET",
          this.MANUAL_REVIEW_WORKSHEET
        );
        tableau.extensions.settings.set(
          "MANUAL_REVIEW_DATASOURCE",
          this.MANUAL_REVIEW_DATASOURCE
        );
        tableau.extensions.settings.set("MANUAL_REVIEW_USER", this.MANUAL_REVIEW_USER);
        tableau.extensions.settings.set(
          "MANUAL_REVIEW_SISE_KEY",
          this.MANUAL_REVIEW_SISE_KEY
        );
        tableau.extensions.settings.set(
          "MANUAL_REVIEW_VERIFICATION",
          this.MANUAL_REVIEW_VERIFICATION
        );
        tableau.extensions.settings.set(
          "MANUAL_REVIEW_VALIDATION_ID",
          this.MANUAL_REVIEW_VALIDATION_ID
        );

        //informa que o primeiro setup já foi realizado
        tableau.extensions.settings.set("first_setup", "no");

        tableau.extensions.settings
          .saveAsync()
          .then((result) => {
            console.log("Settings saved.");
            tableau.extensions.ui.closeDialog();
            // ... process results
          })
          .catch((error) => {
            // ...
            // ... code for error handling
          });
      }
    },
  },
  mounted() {
    let ref = this;
    tableau.extensions.initializeDialogAsync().then(() => {
      //carregar planilhas do dashboard
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      ref.worksheets = dashboard.worksheets.map((worksheet) => worksheet.name);

      ref.LEAKAGE_WORKSHEET = tableau.extensions.settings.get("LEAKAGE_WORKSHEET");
      ref.LEAKAGE_DATASOURCE_TO_REFRESH = tableau.extensions.settings.get(
        "LEAKAGE_DATASOURCE_TO_REFRESH"
      );
      ref.LEAKAGE_USER_FIELD = tableau.extensions.settings.get("LEAKAGE_USER_FIELD");
      ref.LEAKAGE_SISE_KEY_FIELD = tableau.extensions.settings.get(
        "LEAKAGE_SISE_KEY_FIELD"
      );
      ref.LEAKAGE_COVERAGE_ID_FIELD = tableau.extensions.settings.get(
        "LEAKAGE_COVERAGE_ID_FIELD"
      );
      ref.LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD = tableau.extensions.settings.get(
        "LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD"
      );
      ref.leakage_fields = JSON.parse(tableau.extensions.settings.get("leakage_fields"));
      ref.leakage_datasources = JSON.parse(
        tableau.extensions.settings.get("leakage_datasources")
      );

      ref.VALIDATION_WORKSHEET = tableau.extensions.settings.get("VALIDATION_WORKSHEET");
      ref.VALIDATION_DATASOURCE_TO_REFRESH = tableau.extensions.settings.get(
        "VALIDATION_DATASOURCE_TO_REFRESH"
      );
      ref.VALIDATION_USER_FIELD = tableau.extensions.settings.get(
        "VALIDATION_USER_FIELD"
      );
      ref.VALIDATION_SISE_KEY_FIELD = tableau.extensions.settings.get(
        "VALIDATION_SISE_KEY_FIELD"
      );
      ref.VALIDATION_AUTOMATED_RESULT_FIELD = tableau.extensions.settings.get(
        "VALIDATION_AUTOMATED_RESULT_FIELD"
      );
      ref.VALIDATION_COVERAGE_ID_FIELD = tableau.extensions.settings.get(
        "VALIDATION_COVERAGE_ID_FIELD"
      );
      ref.VALIDATION_VALIDATION_ID_FIELD = tableau.extensions.settings.get(
        "VALIDATION_VALIDATION_ID_FIELD"
      );

      ref.MANUAL_REVIEW_WORKSHEET = tableau.extensions.settings.get(
        "MANUAL_REVIEW_WORKSHEET"
      );
      ref.MANUAL_REVIEW_DATASOURCE = tableau.extensions.settings.get(
        "MANUAL_REVIEW_DATASOURCE"
      );
      ref.MANUAL_REVIEW_USER = tableau.extensions.settings.get("MANUAL_REVIEW_USER");
      ref.MANUAL_REVIEW_SISE_KEY = tableau.extensions.settings.get(
        "MANUAL_REVIEW_SISE_KEY"
      );
      ref.MANUAL_REVIEW_VERIFICATION = tableau.extensions.settings.get(
        "MANUAL_REVIEW_VERIFICATION"
      );
      ref.MANUAL_REVIEW_VALIDATION_ID = tableau.extensions.settings.get(
        "MANUAL_REVIEW_VALIDATION_ID"
      );

      ref.validation_fields = JSON.parse(
        tableau.extensions.settings.get("validation_fields")
      );
      ref.validation_datasources = JSON.parse(
        tableau.extensions.settings.get("validation_datasources")
      );

      ref.onChangeLeakageWorksheet();
      ref.onChangeValidationWorksheet();
    });
  },
};
</script>

<style scoped></style>
