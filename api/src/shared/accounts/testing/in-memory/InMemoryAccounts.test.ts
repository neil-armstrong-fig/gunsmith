import {accountsContract} from "@src/shared/accounts/testing/contract/AccountsContract";
import {InMemoryAccounts} from "@src/shared/accounts/testing/in-memory/InMemoryAccounts";

accountsContract(async () => new InMemoryAccounts());
