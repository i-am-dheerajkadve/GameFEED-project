{{/* Resolve namespace */}}
{{- define "gamefeed-config.namespace" -}}
{{- if .Values.global.namespace -}}
{{- .Values.global.namespace -}}
{{- else -}}
{{- .Values.namespace.name -}}
{{- end -}}
{{- end -}}

{{/* Resource name must stay stable because other services call it by DNS name */}}
{{- define "gamefeed-config.resourceName" -}}
{{- .Values.resourceName | default .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "gamefeed-config.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "gamefeed-config.resourceName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
