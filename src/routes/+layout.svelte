<script>
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	// One row per `afterNavigate` call. Kept in sessionStorage, so loading a page directly
	// appends to the log instead of starting a new one.
	let log = $state([]);

	afterNavigate((navigation) => {
		let pathname;
		try {
			pathname = String(navigation.from?.url.pathname);
		} catch (error) {
			pathname = String(error);
		}

		const row = {
			path: location.pathname,
			type: navigation.type,
			from: JSON.stringify(navigation.from),
			pathname,
			ok: !pathname.startsWith('TypeError')
		};

		log = [...JSON.parse(sessionStorage.getItem('log') ?? '[]'), row];
		sessionStorage.setItem('log', JSON.stringify(log));
	});

	function clear() {
		sessionStorage.removeItem('log');
		log = [];
	}
</script>

<header>
	<nav>
		<a href="/ssr">/ssr</a>
		<a href="/spa">/spa <small>(ssr = false)</small></a>
	</nav>
	<div class="actions">
		<button onclick={() => location.reload()}>Reload page</button>
		<button onclick={clear}>Clear log</button>
	</div>
</header>

{@render children()}

<section>
	<h2>afterNavigate log</h2>
	<table data-rows={log.length}>
		<thead>
			<tr>
				<th>page</th>
				<th>type</th>
				<th>navigation.from</th>
				<th>navigation.from?.url.pathname</th>
			</tr>
		</thead>
		<tbody>
			{#each log as row, i (i)}
				<tr class:bad={!row.ok}>
					<td>{row.path}</td>
					<td>{row.type}</td>
					<td class="value">{row.from}</td>
					<td class="value">{row.pathname}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: #0f172a;
	}
	:global(main) {
		padding: 28px 24px;
	}
	:global(h1) {
		margin: 0 0 6px;
		font-size: 44px;
	}
	:global(main p) {
		margin: 0;
		color: #475569;
		font-size: 17px;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 24px;
		background: #0f172a;
	}
	nav {
		display: flex;
		gap: 24px;
	}
	nav a {
		color: #e2e8f0;
		font: 600 18px ui-monospace, monospace;
	}
	small {
		color: #94a3b8;
		font-weight: 400;
	}
	.actions {
		display: flex;
		gap: 12px;
	}
	button {
		padding: 8px 14px;
		font: 600 15px system-ui, sans-serif;
		border: 0;
		border-radius: 6px;
		background: #e2e8f0;
		color: #0f172a;
		cursor: pointer;
	}
	section {
		padding: 0 24px 24px;
	}
	h2 {
		margin: 0 0 12px;
		font-size: 20px;
	}
	table {
		border-collapse: collapse;
		font: 16px ui-monospace, monospace;
	}
	th {
		padding: 8px 20px 8px 0;
		text-align: left;
		font: 600 14px system-ui, sans-serif;
		color: #475569;
		border-bottom: 2px solid #cbd5e1;
	}
	td {
		padding: 10px 20px 10px 0;
		border-bottom: 1px solid #e2e8f0;
		vertical-align: top;
	}
	td.value {
		max-width: 420px;
		overflow-wrap: anywhere;
		font-weight: 700;
		color: #16a34a;
	}
	tr.bad td.value {
		color: #dc2626;
	}
</style>
