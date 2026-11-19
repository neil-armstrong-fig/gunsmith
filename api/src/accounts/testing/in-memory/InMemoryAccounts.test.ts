import {accountsContract} from "@src/accounts/testing/contract/AccountsContract";
import {InMemoryAccounts} from "@src/accounts/testing/in-memory/InMemoryAccounts";

accountsContract(async () => new InMemoryAccounts());
