const makeSafeProxy = (getClientFn) => {
    return new Proxy({}, {
        get(target, prop) {
            const client = getClientFn();
            if (!client) {
                console.warn(`[SupabaseClient Proxy] Warning: Client is not initialized for property "${String(prop)}". Returning fallback mock.`);
                
                if (prop === 'auth') {
                    return {
                        admin: new Proxy({}, {
                            get(t, p) {
                                return () => Promise.resolve({ data: { users: [], user: null }, error: null });
                            }
                        }),
                        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
                        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
                        signOut: () => Promise.resolve({ error: null })
                    };
                }
                
                if (prop === 'storage') {
                    return {
                        from: () => ({
                            getPublicUrl: () => ({ data: { publicUrl: '' } }),
                            upload: () => Promise.resolve({ data: null, error: null })
                        })
                    };
                }

                if (prop === 'rpc') {
                    return () => Promise.resolve({ data: null, error: null });
                }

                const chainable = () => chainable;
                chainable.select = () => chainable;
                chainable.insert = () => chainable;
                chainable.update = () => chainable;
                chainable.upsert = () => chainable;
                chainable.delete = () => chainable;
                chainable.eq = () => chainable;
                chainable.neq = () => chainable;
                chainable.gt = () => chainable;
                chainable.lt = () => chainable;
                chainable.gte = () => chainable;
                chainable.lte = () => chainable;
                chainable.or = () => chainable;
                chainable.order = () => chainable;
                chainable.limit = () => chainable;
                chainable.single = () => chainable;
                chainable.maybeSingle = () => chainable;
                
                chainable.then = (resolve) => resolve({ data: [], error: null });
                
                return chainable;
            }
            
            const val = Reflect.get(client, prop);
            if (typeof val === 'function') {
                return val.bind(client);
            }
            return val;
        }
    });
};

const nullClient = null;
const safeProxy = makeSafeProxy(() => nullClient);

async function runTest() {
    console.log('Testing chainable database query...');
    const res = await safeProxy.from('users').select('*').eq('id', 1).single();
    console.log('Query result:', res);

    console.log('\nTesting auth listUsers...');
    const authRes = await safeProxy.auth.admin.listUsers();
    console.log('Auth result:', authRes);

    console.log('\nTesting storage getPublicUrl...');
    const storageRes = safeProxy.storage.from('bucket').getPublicUrl('file.jpg');
    console.log('Storage result:', storageRes);

    console.log('\nTesting rpc...');
    const rpcRes = await safeProxy.rpc('some_function', { arg: 1 });
    console.log('Rpc result:', rpcRes);
}

runTest();
