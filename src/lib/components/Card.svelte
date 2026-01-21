<script lang="ts">
	let { children } = $props();
</script>

<div
	class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm @md:p-6 @lg:p-8"
>
	{@render children()}
</div>
