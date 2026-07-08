{{/* Resolve namespace */}}
{{- define "gamefeed-database.namespace" -}}
{{- if .Values.global.namespace -}}
{{- .Values.global.namespace -}}
{{- else -}}
{{- .Values.namespace.name -}}
{{- end -}}
{{- end -}}

{{/* Resource name must stay stable because other services call it by DNS name */}}
{{- define "gamefeed-database.resourceName" -}}
{{- .Values.resourceName | default .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "gamefeed-database.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "gamefeed-database.resourceName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
